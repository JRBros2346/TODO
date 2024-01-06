use std::error::Error;

fn main() -> Result<(), Box<dyn Error>> {
    client::c(
        "{
        \"id\": \"10121\",
        \"task\": \"Wash Dishes\",
        \"created\": \"2023-01-05\",
        \"status\": \"true\"
    }",
    )?;
    client::c(
        "{
        \"id\": \"10122\",
        \"task\": \"Hit the Gym\",
        \"created\": \"2023-01-05\"
    }",
    )?;
    client::c(
        "{
        \"id\": \"10123\",
        \"task\": \"Eat Food\",
        \"created\": \"2023-01-05\"
    }",
    )?;

    Ok(())
}
