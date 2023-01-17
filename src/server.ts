import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { Client } from "pg";
import { getEnvVarOrFail } from "./support/envVarUtils";
import { setupDBClientConfig } from "./support/setupDBClientConfig";

//-----------------------------------------------------------------------------------------------------setting DATABASE variables
dotenv.config(); //Read .env file lines as though they were env vars.

const dbClientConfig = setupDBClientConfig();
const client = new Client(dbClientConfig);

//-----------------------------------------------------------------------------------------------------Configure express routes
const app = express();

app.use(express.json()); //add JSON body parser to each following route handler
app.use(cors()); //add CORS support to each following route handler

app.get("/", async (req, res) => {
  res.json({ msg: "Hello! There's nothing interesting for GET /" });
});

app.get("/health-check", async (req, res) => {
  try {
    //For this to be successful, must connect to db
    await client.query("select now()");
    res.status(200).send("system ok");
  } catch (error) {
    //Recover from error rather than letting system halt
    console.error(error);
    res.status(500).send("An error occurred. Check server logs.");
  }
});

//-----------------------------------------------------------------------------------------------------requests to DATABASE for USERS table
//-----------------------------------------------------------------------------------------------------GET request to DATABASE for all users
app.get("/users", async (req, res) => {
  const users = await client.query("SELECT * FROM users ORDER BY user_id");
  res.status(200).json(users);
});
//-----------------------------------------------------------------------------------------------------GET request to DATABASE for user by user_id
app.get<{ user_id: number }>("/users/:user_id", async (req, res) => {
  const user_id = req.params.user_id;

  if (user_id === undefined) {
    res.status(404).json(user_id);
  } else {
    const user = await client.query(
      `SELECT * FROM users WHERE user_id = ${user_id}`
    );

    res.status(200).json(user);
  }
});

//-----------------------------------------------------------------------------------------------------POST request to DATABASE for user with BODY
app.post("/users", async (req, res) => {
  const user_name = req.body.user_name;
  const user_isfaculty = req.body.user_isfaculty;

  const text = `INSERT INTO users(user_name, user_isfaculty)  VALUES($1,$2)`;

  const values = [user_name, user_isfaculty];

  const postData = await client.query(text, values);

  res.status(201).json(postData);
});

//-----------------------------------------------------------------------------------------------------DELETE request to DATABASE by user_id
app.delete<{ user_id: number }>("/users/:user_id", async (req, res) => {
  const delete_user = req.params.user_id;
  if (delete_user === undefined) {
    res.status(404).json(delete_user);
  } else {
    await client.query(`DELETE FROM comments WHERE user_id = ${delete_user}`);
    await client.query(`DELETE FROM resources WHERE user_id = ${delete_user}`);
    await client.query(`DELETE FROM users WHERE user_id = ${delete_user}`);

    res.status(200).json(delete_user);
  }
});

//-----------------------------------------------------------------------------------------------------PATCH request to DATABASE for user_name by user_id
app.patch<{ user_id: number }>("/users/:user_id", async (req, res) => {
  const patch_user = req.params.user_id;
  if (patch_user === undefined) {
    res.status(404).json(patch_user);
  } else {
    const new_user_name = req.body.new_user_name;

    await client.query(
      `UPDATE users SET user_name = '${new_user_name}'  WHERE user_id = ${patch_user}`
    );

    res.status(200).json(patch_user);
  }
});

//-----------------------------------------------------------------------------------------------------requests to DATABASE for RESOURCES table
//-----------------------------------------------------------------------------------------------------GET request to DATABASE for ALL resources
app.get("/resources", async (req, res) => {
  const resources = await client.query("SELECT * FROM resources");
  res.status(200).json(resources);
});

//-----------------------------------------------------------------------------------------------------GET request to DATABASE for resource by resource_id
app.get<{ resource_id: number }>(
  "/resources/:resource_id",
  async (req, res) => {
    const resource_id = req.params.resource_id;

    if (resource_id === undefined) {
      res.status(404).json(resource_id);
    } else {
      const resource = await client.query(
        `SELECT * FROM resources WHERE resource_id = ${resource_id}`
      );

      res.status(200).json(resource);
    }
  }
);

//-----------------------------------------------------------------------------------------------------POST request to DATABASE for resource with BODY
app.post("/resources", async (req, res) => {
  const resource_name = req.body.resource_name;
  const author_name = req.body.author_name;
  const user_id = req.body.user_id;
  const resource_description = req.body.resource_description;
  const resource_tags = req.body.resource_tags;
  const resource_content_type = req.body.resource_content_type;
  const resource_user_recomendation = req.body.resource_user_recomendation;
  const resource_recomendation_reason = req.body.resource_recomendation_reason;
  const resource_likes = req.body.resource_likes;
  const resource_link = req.body.resource_link;

  const text = `INSERT INTO resources (resource_post_date, resource_name, author_name, user_id, resource_description, resource_tags, resource_content_type, resource_user_recomendation, resource_recomendation_reason, resource_likes, resource_link)
  VALUES (now(),$1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`;

  const values = [
    resource_name,
    author_name,
    user_id,
    resource_description,
    resource_tags,
    resource_content_type,
    resource_user_recomendation,
    resource_recomendation_reason,
    resource_likes,
    resource_link,
  ];

  const postData = await client.query(text, values);

  res.status(201).json(postData);
});

//-----------------------------------------------------------------------------------------------------DELETE request to DATABASE by resource_id
app.delete<{ resource_id: number }>(
  "/resources/:resource_id",
  async (req, res) => {
    const delete_resource = req.params.resource_id;
    if (delete_resource === undefined) {
      res.status(404).json(delete_resource);
    } else {
      await client.query(
        `DELETE FROM comments WHERE resource_id = ${delete_resource}`
      );
      await client.query(
        `DELETE FROM resources WHERE resource_id = ${delete_resource}`
      );

      res.status(200).json(delete_resource);
    }
  }
);

//-----------------------------------------------------------------------------------------------------PATCH request to DATABASE for resource by resource_id
app.patch<{ resource_id: number }>(
  "/resources/:resource_id",
  async (req, res) => {
    const patch_resource = req.params.resource_id;
    if (patch_resource === undefined) {
      res.status(404).json(patch_resource);
    } else {
      const resource_name = req.body.resource_name;
      const author_name = req.body.author_name;
      const user_id = req.body.user_id;
      const resource_description = req.body.resource_description;
      const resource_tags = req.body.resource_tags;
      const resource_content_type = req.body.resource_content_type;
      const resource_user_recomendation = req.body.resource_user_recomendation;
      const resource_recomendation_reason =
        req.body.resource_recomendation_reason;
      const resource_likes = req.body.resource_likes;
      const resource_link = req.body.resource_link;

      const text = `UPDATE resources SET resource_post_date = now(), resource_name = $1, author_name = $2, user_id = $3, resource_description = $4, resource_tags = $5, resource_content_type = $6, resource_user_recomendation = $7, resource_recomendation_reason = $8, resource_likes = $9, resource_link = $10
  
  WHERE resource_id = ${patch_resource}`;

      const values = [
        resource_name,
        author_name,
        user_id,
        resource_description,
        resource_tags,
        resource_content_type,
        resource_user_recomendation,
        resource_recomendation_reason,
        resource_likes,
        resource_link,
      ];

      const postData = await client.query(text, values);

      res.status(201).json(postData);
    }
  }
);

//-----------------------------------------------------------------------------------------------------requests to DATABASE for COMMENTS table

//-----------------------------------------------------------------------------------------------------connecting to DATABASE
connectToDBAndStartListening();

async function connectToDBAndStartListening() {
  console.log("Attempting to connect to db");
  await client.connect();
  console.log("Connected to db!");

  const port = getEnvVarOrFail("PORT");
  app.listen(port, () => {
    console.log(
      `Server started listening for HTTP requests on port ${port}.  Let's go!`
    );
  });
}
