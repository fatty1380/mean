FORMAT: 1A
HOST: http://outset-shadow.elasticbeanstalk.com/

# Outset

This document describes Available API Functions for interfacing with the Outset Backend

# group Profile

## Profile [/api/profiles/{id}]
A profile contains a limited version of the user object and cannot be updated

+ Parameters
    + id (string)

        The ID of the desired user.

+ Attributes (Profile Base)

### Retrieve a specific Profile [GET]
Retrieves the profile with the given ID.

+ Response 200 (application/json)
    + Attributes (Profile)

## Profiles [/api/profiles]

+ Attributes (array[Profile])

### List all User Profiles [GET]
Returns a list of all user profiles (admin only).

+ Response 200 (application/json)
    + Attributes (Profiles)
    
# Data Structures
    
## User Base (Profile Base)
+ email: pat@joinoutset.com (required, string)
+ username: pat@joinoutset.com (required, string) - will take the value of email if not provided
+ requests: [requiestId] (optional, array[string])
+ friends: [userId] (optional, array[string])
+ addresses: [{Address}] (optional, array[string])
+ phone: 123–457–7890 (optional, string)
    
## Profile Base (Profile Virtuals)
+ id: 55a453104cec3d4a40d4bf9c (fixed, string)
+ firstName: Pat (required, string)
+ lastName: Fowler (required, string)
+ profileImageURL: modules/users/img/profile/default.png (optional, string)
+ company: MongoId reference to Company (optional, Company Base)

## Profile Virtuals (object)
+ isOwner: false (fixed, boolean)
+ isDriver: false (fixed, boolean)
+ isAdmin: false (fixed, boolean)
+ displayName: Pat Fowler (fixed, string)
+ shortName: PatF (fixed, string)

## Company Base (object)
+ id: 55a453104cec3d4a40d4bf9c (fixed, string)

## Driver Attrs (object)
+ handle: Gearjammer (optional, string)
+ license: { class: A endorsements: [H T] state: CA } (optional, License Attrs)
+ about: This is a note about me (optional, string)
+ experience: [] (optional, array)
+ interests: [] (optional, array)
+ reportsData: object (optional, array[object])

## License Attrs (object)
+ class: A (optional, enum)
    + A (string)
    + B (string)
    + C (string)
    + D (string)
+ endorsements: [H,T] (optional, array[string])
+ state: CA (optional, string)
    
    

## Driver Base (User Base)(Driver Attrs)

# Group Driver

**IMPORTANT**: By default, a newly created User will be a Driver. The driver object
adds a few fields to the standard User object. It is expected that you interact 
primarily with the User API for manipulation of the logged in user/driver.

The attributes listed here only represent those fields added to the standard User

## Driver [/api/users]

A Driver object adds a few additional fields on top of the User object. 
All users will be drivers unless otherwise specified.

Please note that this section is illustrative and meant primarily to 
show the additional fields available to a "Driver" as opposed to a regular 
"User"

+ Attributes (Driver Attrs)

## Get Driver by ID [GET /api/drivers/{id}]

+ Parameters
    + id (string) - Driver ID

+ Response 200 (application/json)

    + Attributes (Driver)
    
## Update logged in Driver [PUT /api/users]

+ Attributes (Driver Base)
    
+ Response 200 

    Plus all standard User attributes

    + Attributes (Driver)

# Group User

## User [/api/users/{id}]

The USERS API serves as the root for acting and updating users. These methods operate only on the logged in user and do not have ID parameters available.

+ Attributes (User Base)

## Get Logged in User [GET /api/users/me]

+ Response 200 (application/json)

    + Attributes (User)

+ Response 401 

## Update logged in user [PUT /api/users]

+ Attributes (User Base)
    
+ Response 200 

    + Attributes (User)
    
## Change Profile Picture [POST /api/users/picture]

+ Attributes

    + files (object, required)

+ Response 200

    + Attributes (User Base)
    
## Change User Password [POST /api/users/password]

+ Attributes

    + newPassword : newPass (required, string)
    + currentPassword : currPass ( required, string)
    
+ Response 200 (application/json)

            { message: 'Password changed successfully' }
            
# group Company
There are additional fields, but I am including those fileds which are most important to the mobile app and profile at this time.

Notes: Look in the "Companies" collection in the main `outset-dev` database for more examples.

## List Companies [GET /api/companies]

+ Response 200 (application/json)

    + Attributes array(Company Schema)

    + Body
    
            [{
                name: 'Big Joe\'s Trucks',
                zipCode: '83340',
                locations: [{ type: 'main', streetAddresses: ['123 Fake Street'], city: 'Seattle', state: 'WA', zipCode: '98104'}],
                about: 'This is a bunch of text about how aweseome we are!',
                phone: '650-555-3535'
            }]
            
## Load Company [GET /api/companies/{companyId}]

+ Parameters

    + companyId (string)
    
+ Response 200 (application/json)

    + Attributes (Company Schema)
    
    + Body 
    
            {
                name: 'Big Joe\'s Trucks',
                zipCode: '83340',
                locations: [{ type: 'main', streetAddresses: ['123 Fake Street'], city: 'Seattle', state: 'WA', zipCode: '98104'}],
                about: 'This is a bunch of text about how aweseome we are!',
                phone: '650-555-3535'
            }

# Data Structures

## Company Schema (object)
+ name: `Big Joe's Trucks` (required, string)
+ zipCode: `83340` (optional, string)
+ locations: `[{type: 'main', streetAddresses: [123 fake street], city: 'SF', state: 'CA' }]` (optional, array[Address Schema])
+ about: At Joe's trucks, we believe in you ... (optional, string)
    A string which may contain rudimentary HTML formatting containing information about the company
+ phone: 650-123-4567 (optional, String)
+ profileImageURL: https://server/profile.jpg (optional, string)

## Address Schema (object)
+ type main (optional, enum[string])
    + Default: `main`
    + Members
        + `main`
        + `home`
        + `business`
        + `billing`
        + `other`
+ typeOther 'shipping' (optional, string)
    + Default: null
+ streetAddresses ['123 Fake St'] (optional, array[string])
+ city (optional, string)
+ state (optional, string)
+ zipCode (optional, string)

# group Authentication

These API Methods deal with user Authentication in the app - sign-in, sign-up, forgot and reset password, and eventually, third party auth setups.


## POST /api/auth/signup

+ Attributes
    + email: user@domain.com (required, string) - The user's email address
    + password: somewhere (required, string) - ID of the Choice in form of an integer
    + firstName: Daniel (required, string) - ID of the Choice in form of an integer
    + lastName: Driverman (required, string) - ID of the Choice in form of an integer
    + type: driver (optional, enum) - 'driver' or 'owner' user type, driver by default.


+ Response 200 (application/json)
    
    + Body
            
            {
              "__v": 0,
              "modified": "2015-07-14T00:08:48.866Z",
              "displayName": "Pat Fowler",
              "username": "pat-38@joinoutset.com",
              "provider": "local",
              "_id": "55a453104cec3d4a40d4bf9c",
              "requests": [],
              "friends": [],
              "addresses": [],
              "company": null,
              "driver": null,
              "phone": "",
              "email": "pat-38@joinoutset.com",
              "type": "",
              "created": "2015-07-14T00:08:48.836Z",
              "roles": [
                "user"
              ],
              "oldPass": false,
              "handle": null,
              "profileImageURL": "modules/users/img/profile/default.png",
              "lastName": "Fowler",
              "firstName": "Pat",
              "isOwner": false,
              "isDriver": false,
              "isAdmin": false,
              "shortName": "PatF",
              "id": "55a453104cec3d4a40d4bf9c"
            }
    

+ Response 400 (application/json)

## POST /api/auth/signin

+ Parameters
    + username: user@domain.com (required, string) - The user's email address
    + password: somewhere (required, string) - ID of the Choice in form of an integer

+ Request JSON Credentials


    + Headers
    
            Accept: application/json

    + Body
    
            { 
                "username" : username, 
                "password" : password }

+ Response 200 (application/json)
    + Headers
    

## GET /api/auth/signout

Logs the user out of the app

+ Response 200 

        The user is redirected to the welcome page
        
        
# group Activity Feed

## Feed [/api/feed]
Each user has a single Activity Feed which contains a list of every posted activity from all of their friends. Because of a Read/Write bias, it is important to keep all items being displayed to a user in one place in the DB, rather than reaching out to dozens of places in the database and processing. This adds a "Write Tax" when a user posts a new activity to their friends, but this is much less common action than reading the feed.

+ Attributes (Feed Schema)

## Get My Feed [GET /api/feed]

+ Response 200 (application/json)

    + Attributes (Feed Schema)
    
## Post Item to My Feed [POST /api/feed]

+ Attributes (Feed Item)

+ Response 200 (application/json)

    + Attributes (Feed Item)
    
## Load Specific Feed Item [GET /api/feed/:feedItemId]

+ Parameters
    + feedItemId (string) - The 24-Digit Hex ID for the specific Feed item to load
    
+ Response 200 (application/json)

    + Attributes (Feed Item)
    
## Update Feed Item [PUT /api/feed/:feedItemId]

+ Parameters
    + feedItemId (string) - The 24-Digit Hex ID for the specific Feed item to load

+ Attributes (Feed Item)
    
+ Response 200 (application/json)

    + Attributes (Feed Item)
    
## Comment on Feed Item [POST /api/feed/:feedItemId/comments]

+ Parameters
    + feedItemId (string) - The 24-Digit Hex ID for the specific Feed item to load

+ Attributes

    + comment: 'That was amazing' (required, string)
    
+ Response 200 (application/json)

    + Attributes array[Message Schema]
        
    + Body
    
            [{
                text: 'That sure was great!',
                sender: '55a453104cec3d4a40d4bf9c',
                status: 
                created: '2015-07-14T00:08:48.866Z'
            }]

# Data Structures     

## Feed Schema(object)
+ user: 24D1617HEX574196 (required, string)
+ items: [{title: 'They had a great drive today'}] (required, array[Feed Item])
+ activity: [{title: 'I had a great drive today'}] (required, array[Feed Item])
+ created: 2015-07-12T01:34:43.000Z (required, string)
+ modified: 2015-07-12T01:34:43.000Z (required, string)

## Feed Item (object)

+ title: Great drive today! (required, string)
+ message: This is more information than I usually add, but it would be great if you could see this (optional, string)
+ location: { 'type': 'Point', 'coordinates': [34.123, 48.982] } (optional, GeoJSON)
+ user: 24D1617HEX574196 (required, string)
+ comments: [{message: 'Love it!', user: 24DigitHexId}] (optional, array[Message Schema])
+ likes: [24D1617HEX574196, 24D1617HEX574196] (optional, array[User Base])
+ created: 2015-07-12T01:34:43.000Z (required, string)
+ modified: 2015-07-12T01:34:43.000Z (required, string)

## GeoJSON (object)
+ type: Point (optional, string)
+ coordinates: [34.123, 48.982] (required, array[number])
+ created: 2015-07-12T01:34:43.000Z (required, string)
+ modified: 2015-07-12T01:34:43.000Z (required, string)

    + Body
        {
            type: 'Point',
            coordinates: [34.123, 48.982],
            created: '2015-07-12T01:34:43.000Z',
            modified: '2015-07-12T01:34:43.000Z'
        }

# group Messages

**DRAFT DRAFT DRAFT DRAFT DRAFT**

The previous version of "Messages" was wrapped up in the process of a Driver applying to a Job. Since these concepts are outside the scope of the current mobile app development, and are no longer consistent with our focus of building out a professional social network of truckers, the Messages will be split out into their own api.

## Get Message [GET /api/messages/:messageId]

+ Parameters
    + messageId (string) - The 24-Digit Hex ID for the specific message to load
    
+ Response 200 (application/json)

    + Attributes (Message Schema)


# Data Structures  

## Message Schema (object)
+ sender: 24D1617HEX574196 (optional, string)
    A reference to the user who sent the message. This will be inferred if not supplied
+ text: Hey man! can you hear me? (required, string)
    The text of the message being sent
+ status: 'sent' (optional, enum[string])
    + Default: `draft`
    + Members
        + `draft`
        + `sent`
        + `read`
+ created: 2015-07-12T01:34:43.000Z (required, string)
+ modified: 2015-07-12T01:34:43.000Z (required, string)