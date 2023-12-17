import database from "infra/database"

async function status(request, response) {
  const result = await database.query('SELECT 1 + 1 AS SUM;')
  response.status(200).json({ status: 200})
}

export default status