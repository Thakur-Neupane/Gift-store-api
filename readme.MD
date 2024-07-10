# Login registration workflow

The workflow below explaing step how to buitd robust user registration process stpe by step guide.

## Step1:

creating userand sending verification linke to user email

1. FE: Send user form to backend.
2. BE: receve user and do the followings:
   -- get the password and encrypt
   -- create unique code and store it in the sessioni table with email
   -- format url like `https://yourdomain.com/verify-user?c=iouy8976yuiyoi&e=user@email.com`
   -- send the above link to the user email
3. BE: insert user in the user table
4. BE: respons user saying check their email to verify the account

## Step 2:

For user, opening email and following instruction to click the link received.

1. FE: User clicks on the link in their email and redirected to our webpage `https://yourdomain.com/verify-user?c=iouy8976yuiyoi&e=user@email.com`
2. FE: With in our `verify-user` page, receve the `c` & `e` form the query string
3. FE: send the `c` & `e` to the server to verify
4. BE: create new api endpoint to receive the `{c, e}`
5. BE: verify `{c, e}` is exist in the session table and valide. Delte the data from the session table
   -- if valid, update user status to active and also `isEmailVerified: true`
   --- then, send email notifying the account has been activited and they can sign in now
   --- respons user the same
   -- Else, The linke is invalid
