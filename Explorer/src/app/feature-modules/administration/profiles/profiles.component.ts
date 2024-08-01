import { Component, OnInit } from '@angular/core';
import { Profile } from '../model/profile.model';
import { AdministrationService } from '../administration.service';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { Follow } from '../model/follow.model';

@Component({
  selector: 'xp-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.css']
})
export class ProfilesComponent implements OnInit {
  profiles: Profile[] = [];
  loggedInProfile: Profile | null = null;
  follows: Profile[] = [];
  followedProfiles: { [key: number]: boolean } = {};
  profileFollowed="";
  alreadyFollow: any;
  suggestedProfiles: Profile[] = [];

  constructor(private service: AdministrationService) {}

  ngOnInit(): void {
    // Get the currently logged-in user's profile
    this.service.getByUserId().subscribe({
      next: (loggedInProfile: Profile) => {
        this.loggedInProfile = loggedInProfile;

        // Get all profiles
        this.service.getProfiles().subscribe({
          next: (result: PagedResults<Profile>) => {console.log(result)
            // Filter out the currently logged-in profile
            this.profiles = result.results.filter((profile) => profile.id !== loggedInProfile.id);
          },
          error: (err: any) => {
            console.log(err);
          }
        });

        this.service.getFollowersByFollowingNeo4j(loggedInProfile.id!).subscribe({
          next: (results) => {
            this.suggestedProfiles = results;
          }
        });
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  onFollowClicked(profile: Profile) {
    const followNeo4j: Follow = {
      followingId: profile.id!, // Id of the profile to be followed
      followerId: this.loggedInProfile!.id // Id of the logged-in user
    };
    this.service.addFollowNeo4j(followNeo4j).subscribe({
      next: () => {
        console.log('uspelo')
      }
    });

    if (this.loggedInProfile) {
      // Check if the logged-in profile already follows the selected profile
      this.service.alreadyFollows(profile.id!, this.loggedInProfile.id!).subscribe({
        next: (result: boolean) => {
          if (result) {
            // Display an alert if the combination already exists
            this.alreadyFollow = true;
            this.profileFollowed=`You already follow ${profile.firstName} ${profile.lastName}.`
            
            // alert(`You already follow ${profile.firstName} ${profile.lastName}`);
          } else {
            const follow: Follow = {
              followingId: profile.id!, // Id of the profile to be followed
              followerId: this.loggedInProfile!.id // Id of the logged-in user
            };
  
            this.service.addFollow(follow).subscribe({
              next: (newFollow: Follow) => {
                this.alreadyFollow=false;
                this.profileFollowed=`You have successfully followed ${profile.firstName} ${profile.lastName}`
                //alert(`You have successfully followed ${profile.firstName} ${profile.lastName}`);
                this.followedProfiles[profile.id!] = true;
              },
              error: (err: any) => {
                console.error('Error while following:', err);
              }
            });
          }
        },
        error: (err: any) => {
          console.error('Error while checking if already follows:', err);
        }
      });
    }
  }

  onFollowOKClicked() {
    this.profileFollowed=``
  }
}