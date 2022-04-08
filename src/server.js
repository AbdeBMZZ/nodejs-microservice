const express = require("express");
const bodyParser = require("body-parser");

const fetch = require("node-fetch");
const bcrypt = require("bcryptjs");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const HASURA_OPERATION = `
mutation ($name: String!, $email: String!, $pass: String!) {
  insert_users_one(object: {
    name: $name,
    email: $email,
    password: $pass
  }) {
    id
  }
}
`;

const execute = async (variables, reqHeaders) => {
  const fetchResponse = await fetch("http://localhost:8081/v1/graphql", {
    method: "POST",
    headers: reqHeaders || {},
    body: JSON.stringify({
      query: HASURA_OPERATION,
      variables,
    }),
  });
  return await fetchResponse.json();
};

app.post("/signup", async (req, res) => {
  const { name, email, pass } = req.body.input;

  let hashedPassword = await bcrypt.hash(pass, 10);

  const { data, errors } = await execute(
    { name, email, pass: hashedPassword },
    req.headers
  );

  if (errors) {
    return res.status(400).json({
      message: errors.message,
    });
  }

  //returns user id
  return res.json({
    ...data.insert_users_one,
  });
});

app.listen(PORT);
