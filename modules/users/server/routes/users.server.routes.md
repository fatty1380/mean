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
+ licenses: [(object)] (optional, array[object])
+ about: This is a note about me (optional, string)
+ experience: [] (optional, array)
+ interests: [] (optional, array)
+ reportsData: object (optional, array[object])

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

# group Authentication

These API Methods deal with user Authentication in the app - sign-in, sign-up, forgot and reset password, and eventually, third party auth setups.


## POST /api/auth/signup

+ Attributes
    + email: user@domain.com (required, string) - The user's email address
    + password: somewhere (required, string) - ID of the Choice in form of an integer
    + firstName: Daniel (required, string) - ID of the Choice in form of an integer
    + lastName: Driver (required, string) - ID of the Choice in form of an integer
    + type: driver (required, enum) - Driver or owner user type.


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

# -------------------------------------------------------------

# group Activity Feed

## Feed [GET /api/feed]
Each user has a single Activity Feed which contains a list of every posted activity from all of their friends. Because of a Read/Write bias, it is important to keep all items being displayed to a user in one place in the DB, rather than reaching out to dozens of places in the database and processing. This adds a "Write Tax" when a user posts a new activity to their friends, but this is much less common action than reading the feed.

## Feed (object)
+ user: 24D1617HEX574196 (reference, string)
+ items: [(Feed Item)] (required, array[Feed Item])
+ activity: [(Feed Item)] (required, array[Feed Item])
+ created: 2015-07-12T01:34:43.000Z (required, string)
+ modified: 2015-07-12T01:34:43.000Z (required, string)

# Activity Feed Item
The Activity Feed item represents an individual checkin made by a user and broadcast to thier friends. Feed items may also be posted by companies, but the object itself will be unchanged.

## Feed Item (object)
+ title: Great drive today! (required, string)
+ message: This is more information than I usually add, but it would be great if you could see this (optional, string)
+ location: { type: 'Point', coordinates: [34.123, 48.982] } (optional, GeoJSON)
+ user: 24D1617HEX574196 (reference, string)
+ comments: [{message: 'Love it!', user: 24DigitHexId}] (optional, object)
+ likes: [24D1617HEX574196, 24D1617HEX574196] (optional, array[User Base])
+ created: 2015-07-12T01:34:43.000Z (required, string)
+ modified: 2015-07-12T01:34:43.000Z (required, string)

## GeoJSON (object)
+ type: Point (optional, String)
+ coordinates: [34.123, 48.982] (required, array[Number])
+ created: 2015-07-12T01:34:43.000Z (required, string)
+ modified: 2015-07-12T01:34:43.000Z (required, string)

    + Body
        {
            type: 'Point',
            coordinates: [34.123, 48.982],
            created: '2015-07-12T01:34:43.000Z',
            modified: '2015-07-12T01:34:43.000Z'
        }
        
## Message Schema
Currently, the concept of a message is wrapped up in a Driver-Company connection, which is no longer the way we want to approach this. The schema will remain the same, but the existing access to it and rights surrounding who you can message will be changed.

## API Routes
API Routes are currently in progress, but will be handled very similarly to other user APIs.

### Messages (Message Body) [GET /api/user/messages]
** DRAFT DRAFT DRAFT **

## Message (object)
+ sender: 24D1617HEX574196 (reference, string)
    - A reference to the user who sent the message
+ text: Hey man! can you hear me? (required, string)
    - The text of the message being sent
+ status: 'sent' (optional, string(enum['draft', 'sent', 'read']))
+ created: 2015-07-12T01:34:43.000Z (required, string)
+ modified: 2015-07-12T01:34:43.000Z (required, string)
 
### Sample Object
    + Body
        {
            sender: '55a453104cec3d4a40d4bf9c',
            text: 'Hey Bob, have you seen the news today?',
            status: 'sent',
            created: '2015-07-12T01:34:43.000Z',
            modified: '2015-07-12T01:34:43.000Z'
        }

## Company Base
There are additional fields, but I am including those fileds which are most important to the mobile app and profile at this time.

+ name: Big Joe's Trucks (required, string)
+ zipCode: 83340 (optional, string)
+ locations: [{ 123 fake street ... }] (optional, array[Address Base])
+ about: At Joe's trucks, we believe in you ... (optional, string)
    - A string which may contain rudimentary HTML formatting containing information about the company
+ phone: 650-123-4567 (optional, String)
+ profileImageURL: https://server/profile.jpg (optional, String)

### Sample Object
    {
        name: 'Big Joe\'s Trucks',
        zipCode: '83340',
        locations: [{ type: 'main', streetAddresses: ['123 Fake Street'], city: 'Seattle', state: 'WA', zipCode: '98104'}],
        about: 'This is a bunch of text about how aweseome we are!',
        phone: '650-555-3535'
    }

Notes: Look in the "Companies" collection in the main `outset-dev` database for more examples.

+ Companies [GET /api/companies]
should return a list of all companies

## Address Base


