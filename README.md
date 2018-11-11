Beginning commands:
1) npm init - sets up node server
2) npm i express body-parser mongoose concurrently (npm install packages we need)
3) npm i -D nodemon (nodemon is used to monitor for changes and then restart server, -D saves a development dependency)



To run the server:
1) npm run server

To check api:
1) use postman to make get, post, delete, etc requests


### Comments:

**Endpoints:**
1.  Post Comment (method = POST, endpoint='/api/comments/'):

    ```
    POST : http://localhost:5000/api/comments/
    Request Body:
    
    {
        "author": "5bde0a49bf78e441b28e0fb8",
        "description" : "Comment 6"
    }
    
    Response Body:
    {
        "votes": 0,
        "spamCount": 0,
        "_id": "5be4f56a1007487b470a1378",
        "author": "5bde0a49bf78e441b28e0fb8",
        "description": "Comment 6",
        "date": "2018-11-09T02:48:10.411Z",
        "__v": 0
    }
    ```
   
2.  Get Comments (method = GET, endpoint='/api/comments/'):
    
    Calling this API will return the array of comment objects sorted according to vote count. Provide the page number in the URL.
    ```
    GET : http://localhost:5000/api/comments/{page_number}
    
    Response Body:
    [
        {
            "votes": 1,
            "spamCount": 0,
            "_id": "5be4eb3fc8235c7ac03a19e3",
            "author": "5bde0a49bf78e441b28e0fb8",
            "description": "Comment 6",
            "date": "2018-11-09T02:04:47.008Z",
            "__v": 0
        },
        {
            "votes": 0,
            "spamCount": 0,
            "_id": "5be4eb22c8235c7ac03a19de",
            "author": "5bde0a49bf78e441b28e0fb8",
            "description": "Comment 1",
            "date": "2018-11-09T02:04:18.942Z",
            "__v": 0
        }
    ]
    
    ```

3.  Upvote/Downvote Comments
    
    Upvote (method = PUT, endpoint='/api/comments/upvote/{comment_id}')
   
    Downvote (method = PUT, endpoint='/api/comments/downvote/{comment_id}')
   
    Calling one of them will manipulate the votes for a certain comment
   
4.  Spam (method = PUT, endpoint='/api/comments/report/{comment_id}')
    
    Calling this api will increment the spam counter for given comment id