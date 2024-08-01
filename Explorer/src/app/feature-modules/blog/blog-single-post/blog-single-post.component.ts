import { Component, EventEmitter, OnInit } from '@angular/core';
import { BlogService } from '../blog.service';
import { Router } from '@angular/router';
import { Blog, BlogStatus } from '../model/blog.model';
import { ActivatedRoute } from '@angular/router';
import { BlogComment } from '../model/blog-comment.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { Rating } from '../model/blog-rating.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { Observable } from 'rxjs';
import { TourAuthoringService } from '../../tour-authoring/tour-authoring.service';
import { AdministrationService } from '../../administration/administration.service';
import { Checkpoint } from '../../tour-authoring/model/checkpoint.model';
import { Equipment } from '../../tour-authoring/model/equipment.model';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'xp-blog-single-post',
  templateUrl: './blog-single-post.component.html',
  styleUrls: ['./blog-single-post.component.css']
})

export class BlogSinglePostComponent implements OnInit {
  blogPost: Blog;
  blogSinglePost: BlogSinglePostComponent;
  blogId: string;
  comments: BlogComment[] = [];
  rating: Rating;
  upvoted: boolean = false;
  downvoted: boolean = false;
  ratingCount: number = 0;
  ratingCountUpdated = new EventEmitter<number>();
  similarBlogs: Blog[] = [];
  checkpoints: Checkpoint[]
  equipment: Equipment[]
  touristDistance: number=0;
  shouldRenderComments: boolean = false;

constructor(private blogService: BlogService, private route: ActivatedRoute, private authService: AuthService, 
  private router: Router, private tourService: TourAuthoringService, private equipmentService: AdministrationService, private viewportScroller: ViewportScroller) { }

ngOnInit(): void {
  this.route.paramMap.subscribe((params) => {
    const blogId = params.get('id');
    this.getComments(blogId!)
    if (blogId) {
      this.blogId = blogId;
      this.blogService.getBlog(this.blogId).subscribe((data: Blog) => {
        this.blogPost = data;
        this.blogService.getSimilarBlogs(this.blogPost).subscribe({
          next: (result: PagedResults<Blog>) => {
            //@ts-ignore
            this.similarBlogs = result;
          }
        });
       if (blogId) {
        this.blogService.getRatingCount(this.blogId).subscribe((ratingCount) => {
          this.ratingCount = ratingCount.count;
        if(this.blogPost.tourReport){
          this.touristDistance = this.blogPost.tourReport.length;
          this.tourService.getCheckpointsByVisitedCheckpoints(this.blogPost.tourReport.checkpointsVisited).subscribe({
            next: (result: PagedResults<Checkpoint>) =>{
              this.checkpoints = result.results;
            }
          })
          this.equipmentService.getEquipmentByIdsTourist(this.blogPost.tourReport.equipment).subscribe({
            next: (result: PagedResults<Equipment>) =>{
              this.equipment = result.results;
            }
          })
        }
      });
      } else {
      }
      });
    }
  });
  }

  getComments(blogId: string) {
    this.blogService.getCommentsByBlogId(blogId).subscribe({
      next: (data) => {console.log(data)
        this.shouldRenderComments = true;
        this.comments = data.data
      }
    });
  }

  updateRatingCount() {
    this.blogService.getRatingCount(this.blogId).subscribe((ratingCount) => {
      this.ratingCount = ratingCount.count;
      this.ratingCountUpdated.emit(ratingCount);
    });
  }

  upvoteClick() {
    let blog$: Observable<Blog> = this.blogService.getBlog(this.blogId);
      blog$.subscribe((blog: Blog) => {
        if (blog.status == BlogStatus.Closed) {
          return;
        }
        else {
          const userId = this.authService.user$.value.id;
          this.upvoted = true;
          this.downvoted = false;
          const rating: Rating = {
            isUpvote: true,
            userId: userId,
            blogId: this.blogId
          };
          this.blogService.addRating(rating).subscribe({
            next: () => {
              this.updateRatingCount();
            },
            error: (error) => {
            }
          });
        }
      })
  }

  downvoteClick() {
    let blog$: Observable<Blog> = this.blogService.getBlog(this.blogId);
      blog$.subscribe((blog: Blog) => {
        if (blog.status == BlogStatus.Closed) {
          return;
        }
        else{
          const userId = this.authService.user$.value.id;
          this.upvoted = false;
          this.downvoted = true;
          const rating: Rating = {
            isUpvote: false,
            userId: userId,
            blogId: this.blogId
          };
          this.blogService.addRating(rating).subscribe({
            next: () => {
              this.updateRatingCount();
            },
            error: (error) => {
            }
          });
        }
      })
  }

  sendRating() {
    this.blogService.addRating(this.rating).subscribe();
  }
  
  getBlogComment(): void {
    this.blogService.getBlogComment().subscribe({
      next: (result: PagedResults<BlogComment>) => {
        this.comments = result.results;
      },
      error: () => {
      }
    })
  }

  onReadMoreClicked(id: string){
    this.router.navigate(['blog-single-post', id]).then(() => {
      this.viewportScroller.scrollToPosition([0, 0]);
    });
  }
}
