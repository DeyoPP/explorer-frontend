import { Component } from '@angular/core';
import { BlogService } from '../blog.service';
import { Blog, BlogCategory, BlogStatus, BlogCategoryValues  } from '../model/blog.model';
import { Router } from '@angular/router';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';


@Component({
  selector: 'xp-blog-review',
  templateUrl: './blog-review.component.html',
  styleUrls: ['./blog-review.component.css']
})
export class BlogReviewComponent {
  blogs: Blog[] = [];
  blogRows: any[] = [];
  itemsPerPage = 12;
  currentPage = 1; 
  totalPages: number; 
  totalPageArray: number[] = [];
  BlogCategory: BlogCategory;
  originalBlogs: Blog[] = [];
  user: User | undefined;

  constructor(private service: BlogService, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
      this.getFollowingBlogs(user.id);
    });
  }

  getFollowingBlogs(userId: number): void {
    this.service.getFollowing(userId).subscribe({
      next: (res) => {
        //@ts-ignore
        res.forEach(number => {
          this.service.getBlogsByUserId(number).subscribe({
            next: (res) => {
              //@ts-ignore
              this.blogs.push(...res);
              //@ts-ignore
              this.originalBlogs.push(...res);
              this.totalPages = Math.ceil(this.blogs.length / this.itemsPerPage); 
              this.totalPageArray = Array.from({ length: this.totalPages }, (_, index) => index + 1);
              this.updateBlogRows();
            }
          })
        });
      }
    });
  }

  getBlogs(): void {
    this.service.getBlogs().subscribe({
      next: (result: PagedResults<Blog>) => {
        //@ts-ignore
        this.blogs = result;
        //@ts-ignore
        this.originalBlogs = [...result];
        this.totalPages = Math.ceil(this.blogs.length / this.itemsPerPage); 
        this.totalPageArray = Array.from({ length: this.totalPages }, (_, index) => index + 1);
        this.updateBlogRows();
      },
      error: () => {
        
      }
    });
  }

  updateBlogRows() {
    this.blogRows = [];
    for (let i = 0; i < this.blogs.length; i += 3) {
      this.blogRows.push(this.blogs.slice(i, i + 3));
    }
  }

  get blogStatus() {
    return BlogStatus; 
  }

  get category() {
    return BlogCategory; 
  }

  filterByCategory(category: BlogCategory): void {
    if (category === null) {
      this.getBlogs();
    } else {
      this.service.getByCategory(category).subscribe({
        next: (result) => {
          //@ts-ignore
          this.blogs = result;
          this.updateBlogRows();
        }
      });
    }
  }

  filterByStatus(status: BlogStatus | null): void {
    console.log('Filtering blogs by status:', status);
  
    if (status === null) {
      this.getBlogs();
    } else {
      this.service.getBlogsByStatus(status).subscribe({
        next: (result: PagedResults<Blog>) => {
          console.log('Filtered blogs result:', result);
  
          if (result.results && result.results.length > 0) {
            this.blogs = result.results;
            this.totalPages = Math.ceil(this.blogs.length / this.itemsPerPage);
            this.totalPageArray = Array.from({ length: this.totalPages }, (_, index) => index + 1);
              
            this.updateBlogRows();
          } else {
            this.handleNoResults();
          }
        },
        error: (error) => {
          this.handleHttpError(error);
        }
      });
    }
  }
  
  handleNoResults(): void {
    this.blogs = []; 
    this.totalPages = 0; 
    this.totalPageArray = [];
    this.currentPage = 1;
    this.updateBlogRows();

    console.log('Nema rezultata za traženi status.');
  }

  handleHttpError(error: any): void {

    if (error.status === 404) {
      this.handleNoResults();
    } else {
      console.error('HTTP Error:', error);
    }
  }

  changePage(page: number) {
    this.currentPage = page;
    this.updateBlogRows();
  }

  chunkArray(array: any[], size: number) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  }

  onReadMoreClicked(id: number){
    this.router.navigate(['blog-single-post', id]);
  }


}
