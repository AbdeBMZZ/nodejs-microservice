const fetch = require("node-fetch");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const HASURA_OPERATION = `
mutation ($name:String!, $email:String!,$pass:String! )
{insert_users_one(object:{
  name:$name,
  email:$email,
  password: $pass
})
  {id}
}
`;

// execute the parent operation in Hasura
const execute = async (variables) => {
  const fetchResponse = await fetch("http://localhost:8080/v1/graphql", {
    method: "POST",
    body: JSON.stringify({
      query: HASURA_OPERATION,
      variables,
    }),
  });
  const data = await fetchResponse.json();
  console.log("DEBUG: ", data);
  return data;
};

// Request Handler
app.post("/signup", async (req, res) => {
  // get request input
  const { name, email, pass } = req.body.input;

  // run some business logic

  // execute the Hasura operation
  const { data, errors } = await execute({ name, email, pass });

  // if Hasura operation errors, then throw error
  if (errors) {
    return res.status(400).json(errors[0]);
  }

  // success
  return res.json({
    ...data.insert_users_one,
  });
});

app.listen(PORT);
