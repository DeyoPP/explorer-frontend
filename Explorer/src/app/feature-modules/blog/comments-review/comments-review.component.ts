import { Component, Input, OnInit } from '@angular/core';
import { BlogService } from '../blog.service';
import { BlogComment } from '../model/blog-comment.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';


@Component({
  selector: 'xp-comments-review',
  templateUrl: './comments-review.component.html',
  styleUrls: ['./comments-review.component.css']
})
export class CommentsReviewComponent implements OnInit {
  @Input() comments: BlogComment[];
  blogId : string;
  selectedBlogComment: BlogComment | null;
  shouldRenderBlogCommentForm: boolean = false;
  shouldEdit: boolean = false;
  userNames: { [key: number]: string } = {};
  currentUserId: number;

  constructor(private blogService: BlogService, private route: ActivatedRoute, private authService: AuthService) { }

  editedCommentText: string = '';

  onEditClicked(comment: BlogComment): void {
    this.selectedBlogComment = comment;
    this.editedCommentText = comment.text;
  }

  onSaveCommentEdit(comment: BlogComment): void {
    if (this.selectedBlogComment) {
      const updatedComment = { ...this.selectedBlogComment, text: this.editedCommentText };
      this.blogService.updateBlogComment(updatedComment).subscribe((result) => {
        if (result) {
          this.comments = this.comments.map((comment) => {
            return comment.id === updatedComment.id ? updatedComment : comment;
          });
          this.selectedBlogComment = null;
          this.editedCommentText = '';
        }
      });
    }
  }

  onCancelEdit(): void {
    this.selectedBlogComment = null;
    this.editedCommentText = '';
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const blogId = params['id'];
      this.blogId = blogId;
      this.currentUserId = this.authService.user$.value.id;
      if (blogId) {
        this.getCommentsByBlogId(blogId);
      }
    });
  }
  getTourReviewByTourId(tourId: number) {
    throw new Error('Method not implemented.');
  }
 

  getCommentsByBlogId(blogId: string): void {
    this.blogService.getCommentsByBlogId(blogId).subscribe({
      next: (result) => {
        //@ts-ignore
        this.comments = result;
      }
    });
  }

  deleteBlogComment(id: string): void {
    this.blogService.deleteBlogComment(id).subscribe({
      next: () => {
        this.getCommentsByBlogId(this.blogId);
      },
    })
  }

  getBlogComment(): void {
    this.blogService.getBlogComment().subscribe({
      next: (result: PagedResults<BlogComment>) => {
        this.comments = result.results;
      }
    })
  }
}

