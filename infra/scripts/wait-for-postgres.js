const { exec } = require("node:child_process");

function checkPostgres() {
  exec("docker exec postgres-dev pg_isready --host localhost", handleReturn);

  function handleReturn(error, stdout) {
    if (stdout.search("accepting connections") === -1) {
      console.log("🟠 Postgres is not ready yet");
      setTimeout(checkPostgres, 500);
      return;
    }

    console.log("🟢 Postgres is ready");
  }
}

console.log("🔴 Waiting for Postgres");
checkPostgres();
