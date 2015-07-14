FORMAT: 1A
HOST: http://polls.apiblueprint.org/

# outset

YES!!!

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
    
## Profile Base (Profile Virtuals)
+ id: 55a453104cec3d4a40d4bf9c (fixed, string)
+ firstName: Pat (required, string)
+ lastName: Fowler (required, string)
+ profileImageURL: modules/users/img/profile/default.png
+ handle: Handle (optional, string)
+ company: MongoId reference to Company (optional, Company Base)
+ driver: MongoId reference to Driver (optional, Driver Base)

## Profile Virtuals (object)
+ isOwner: false (fixed, boolean)
+ isDriver: false (fixed, boolean)
+ isAdmin: false (fixed, boolean)
+ displayName: Pat Fowler (fixed, string)
+ shortName: PatF (fixed, string)

## Company Base (object)
+ id: 55a453104cec3d4a40d4bf9c (fixed, string)

## Driver Base (object)
+ id: 55a453104cec3d4a40d4bf9c (fixed, string)

# Group User

## User [/api/users]

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

    + Files : form upload of picture data (required)
	
+ Response 200

    + Attributes (User Base)
    
## Change User Password [POST /api/users/password]

+ Attributes

    + newPassword : newPass (required, string)
    + currentPassword : currPass ( required, string)
    
+ Response 200 (application/json)

            { message: 'Password changed successfully' }


# Data Structures

## User Base (Profile Base)
+ username: pat@joinoutset.com (required, string)
+ email: pat@joinoutset.com (required, string)
+ requests: [requiestId] (optional, array[string])
+ friends: [userId] (optional, array[string])
+ addresses: [{Address}] (optional, array[string])
+ phone: "123-457-7890" (optional, string)

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
