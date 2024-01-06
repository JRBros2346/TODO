use std::time::Duration;
use ureq::{AgentBuilder, Error};

pub fn c(body: &str) -> Result<(), Error> {
    let agent = AgentBuilder::new()
        .timeout_read(Duration::from_secs(5))
        .timeout_write(Duration::from_secs(5))
        .timeout_connect(Duration::from_secs(5))
        .build();
    agent
        .post("https://localhost:6969/")
        .set("Content-Type", "application/json")
        .send_json(body)?;
    Ok(())
}
pub fn r() -> Result<String, Error> {
    let agent = AgentBuilder::new()
        .timeout_read(Duration::from_secs(5))
        .timeout_write(Duration::from_secs(5))
        .timeout_connect(Duration::from_secs(5))
        .build();
    Ok(agent.get("https://localhost:6969/").call()?.into_string()?)
}
pub fn u(body: &str) -> Result<(), Error> {
    let agent = AgentBuilder::new()
        .timeout_read(Duration::from_secs(5))
        .timeout_write(Duration::from_secs(5))
        .timeout_connect(Duration::from_secs(5))
        .build();
    agent
        .post("https://localhost:6969/")
        .set("Content-Type", "application/json")
        .send_json(body)?;
    Ok(())
}
pub fn d(id: isize) -> Result<(), Error> {
    let agent = AgentBuilder::new()
        .timeout_read(Duration::from_secs(5))
        .timeout_write(Duration::from_secs(5))
        .timeout_connect(Duration::from_secs(5))
        .build();
    agent
        .get(&format!("https://localhost:6969/{}/", id))
        .call()?;
    Ok(())
}
