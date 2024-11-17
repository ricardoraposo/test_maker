pub fn replace_last_three(original: &str, replacement: &str) -> String {
    if original.len() < 3 {
        replacement.to_string()
    } else {
        let without_last_three = &original[..original.len() - 3];
        format!("{}{}", without_last_three, replacement)
    }
}
