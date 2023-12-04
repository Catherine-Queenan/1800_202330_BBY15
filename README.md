# Project Title
Neighbourhood Bark

## 1. Project Description
State your app in a nutshell, or one-sentence pitch. Give some elaboration on what the core features are.  
Neighbourhood Bark is a web-based mobile app for dog owners looking to visit dog parks. The app allows them to 
reliably find park locations, create pup profiles to show off their dogs, write reviews and posts with or without images, 
check the features of any given park, and check to see which dogs are currently visiting a park. Users that allow
the app to track their location will be notified when they arrive at a park, and can select which of their dogs are
currently with them. 

## 2. Names of Contributors
List team members and/or short bio's here... 
* My name is Catherine, and as a professional in the dog industry I am excited for this project to come to fruition!
* My name is Calvin! Excited to be here!
* My name is Joyce! I'm excited to work the project as a team.
	
## 3. Technologies and Resources Used
List technologies (with version numbers), API's, icons, fonts, images, media or data sources, and other resources that were used.
* HTML, CSS, JavaScript
* Bootstrap 5.0 (Frontend library)
* Firebase 8.0 (BAAS - Backend as a Service)
* MapBox 3.0
* Google Fonts: Quicksand and Barlow
* FlatIcon
* SweetAlert2 11.10.01

## 4. Complete setup/installion/usage
State what a user needs to do when they come to your project.  How do others start using your code or application?
Here are the steps ...
* Create an account and read through the welcome page to learn about some key features.
* Create a pup profile(s) for their dog(s).
* Browse through parks, either through the parklist, or the map.
* View park details on individual park pages. Learn more by reading reviews and tags, or seeing the names and images of dogs currently at that park. They can report any posts or reviews they find inappropriate. 
* Visit a park, responding to the pop-up specifying which dog(s) they have with them, when notified.
* Leave the park, at which point they will automatically be removed from the list of dogs currently visiting.
* Optionally write a review for the park, or make a post to share their experience. If they make a mistake, go through user settings to view all of their own posts and reviews and delete any.
* Optionally change their public name and city of residence.
* Optionally look through the FAQ page to learn more about the team and the app. 


## 5. Known Bugs and Limitations
Here are some known bugs:
* Photos do not correctly upload from iphones, unless the app is loaded through certain third party sites such as discord.
* Users cannot edit their posts or reviews once they have created them.
* ...

## 6. Features for Future
What we'd like to build in the future:
* The ability for users to view each other's pup profiles.
* Assigning dog's as regular visitors to park pages, as well as currently visiting, so that users know what to expect even more.
* A search bar with a working filter function to find parks.
* The ability to message and friend other users.
* A navigation function within the app to direct users to their park of choice.
	
## 7. Contents of Folder
Content of the project folder:

```
 Top level of project folder: 
├── .gitignore               # Git ignore file
├── index.html               # landing HTML file, this is what users see when you come to url
├── login.html               # login HTML file, the log-in page
├── welcome.html             # welcome HTML file, this is what users will see when they first-time log in
├── homepage.html            # homepate HTML file, after users log in, this page will display for main features
├── favourites.html          # favourites HTML file, this page shows the park that users favourite
├── parklist.html            # parklist HTML file, this page shows all the parks that stored in Firebase 
├── eachPark.html            # eachPark HTML file, this page 
├── review.html              # review HTML file, this page is for users write reviews to each park
├── thanks.html              # thanks HTML file, this page will show up after submitting the reviews or posts, let users know they successfully submitted
├── map.html                 # map HTML file, this page shows the map using mapbox api 
├── modal.html               # modal HTML file, 
├── allPosts.html            # allPosts HTML file, this page shows all the posts submitted from users
├── report.html              # report HTML file, this page shows a form for users to submit the reason they want to report
├── pupprofileList.html      # pupprofileList HTML file, this page shows all the pup profiles created by users
├── pupprofileForm.html      # pupprofileForm HTML file, when creating the pup profile, this page shows up for user to fill in
├── eachPupprofile.html      # eachPupprofile HTML file, this page shows the information of each pup profile
├── accountSettings.html     # accountSettings HTML file, the user acount setting page
├── userPosts.html           # userPosts HTML file, this page shows all the posts that the user posted
├── faq.html                 # faq HTML file, the faq page
├── template.html            # template HTML file, basic template for all pages for consistency
└── README.md                # 

It has the following subfolders and files:
├── .git                     # Folder for git repo
├── images                   # Folder for images
    /OLB01.jpg               # Acknowledge source
    /OLB02.jpg               # Acknowledge source
    /OLB03.jpg               # Acknowledge source
    /OLB04.jpg               # Acknowledge source
    /OLB05.jpg               # Acknowledge source
    /OLB06.jpg               # Acknowledge source
    /OLB07.jpg               # Acknowledge source
    /OLB08.jpg               # Acknowledge source
    /OLB09.jpg               # Acknowledge source
    /OLB10.jpg               # Acknowledge source
    /OLB11.jpg               # Acknowledge source
    /favicon.ico             # Acknowledge source
    /dogs playing.jpg        # Acknowledge source
    /InverseLogo.png         # Acknowledge source
    /transparent.jpg         # Acknowledge source
    /transparent2.jpg        # Acknowledge source
    /transparent3.jpg        # Acknowledge source
├── scripts                  # Folder for scripts
    /skeleton.js             # 
    /script.js               # 
    /firebaseAPI_BBY15.js    # firebase API stuff, shared across pages
    /authentication.js       # JS for authentication.html
    /homepage.js             # JS for homepage.html
    /favourites.js           # JS for favourites.html
    /parklist.js             # JS for parklist.html
    /eachPark.js             # JS for eachPark.html
    /review.js               # JS for review.html
    /map.js                  # JS for map.html
    /geofencing.js           # JS for geofencing.html
    /allPosts.js             # JS for allPosts.html
    /report.js               # JS for report.html
    /pupprofileList.js       # JS for pupprofileList.html
    /pupprofileForm.js       # JS for pupprofileForm.html
    /eachPupprofile.js       # JS for eachPupprofile.html
    /userPosts.js            # JS for userPosts.html
    /accountSettings.js      # JS for accountSetting.html
    /parksData.json          # Stored the data of parks, including park name, features, latitude and longitude
├── styles                   # Folder for styles
    /colours.css             # Colours used across pages
    /eachPark-pupsPlaying.css# style for eachPark.html
    /eachpp-style.css        # style for eachPupprofile.html
    /ppform-style.css        # style for pupprofileForm.html
    /pplist-style.css        # style for pupprofileList.html
    /hp-style.css            # style for homepage.html
    /index.css               # style for index.html
    /login-style.css         # style for login.html
    /map-popup.css           # style for map.html
    /modal.css               # style for modal.html
    /parklist-boots.css      # style for parklist.html
    /review.css              # style for review.html 
    /style.css               # style for 
    /welcome-boots.css       # style for welcome.html
├── text                     # Folder for footer and navbar
    /footer.html             # footer HTML file
    /navbar.html             # navbar HTML file

Firebase hosting files:
├── .firebase 
    /hosting..cache 
```


