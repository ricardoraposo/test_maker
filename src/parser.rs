use regex::Regex;
use std::collections::HashSet;

#[derive(Debug)]
pub struct Class {
    pub variable: String,
    pub name: String,
}

#[derive(Debug)]
pub struct Module {
    pub class: Class,
    pub methods: Vec<String>,
}

pub fn get_main_name(file: &str) -> Option<String> {
    let re = Regex::new(r"export class (?<name>\w+) \{").unwrap();

    re.captures(file).map(|cap| cap["name"].to_string())
}

pub fn get_modules(file: &str) -> Option<Vec<Class>> {
    let constructor_re = Regex::new(r"constructor\s*\((?s:.*?)\)").unwrap();
    let mut modules: Vec<Class> = Vec::new();

    if let Some(cap) = constructor_re.find(file) {
        let lines: Vec<&str> = cap.as_str().lines().collect();

        let re = Regex::new(r"private readonly (?<variable>\w+): (?<class>\w+)").unwrap();
        for line in lines {
            if let Some(capture) = re.captures(line) {
                modules.push(Class {
                    variable: capture["variable"].to_string(),
                    name: capture["class"].to_string(),
                })
            }
        }
    } else {
        return None;
    }

    Some(modules)
}

pub fn get_methods(file: &str, modules: Vec<Class>) -> Vec<Module> {
    let lines: Vec<&str> = file.lines().collect();
    let mut func_calls = Vec::with_capacity(modules.len());

    for module in modules {
        let mut methods = HashSet::new();
        let formatted_pattern =
            format!(r"this\.{}.(?P<method>\w+)", regex::escape(&module.variable));
        let re = Regex::new(&formatted_pattern).expect("Invalid module regex");

        for line in &lines {
            if let Some(cap) = re.captures(line) {
                methods.insert(cap["method"].to_string());
            }
        }

        func_calls.push(Module {
            class: module,
            methods: methods.into_iter().collect(),
        });
    }

    func_calls
}

pub fn get_functions(file: &str) -> Vec<String> {
    let method_regex =
        Regex::new(r"(?m)^\s*(?:private\s+|public\s+|async\s+)?(\w+)\([^)]*\)\s*(?::\s*[^{]+)?")
            .expect("Invalid regex pattern");
    method_regex
        .captures_iter(file)
        .filter_map(|caps| {
            let method_name = caps.get(1)?.as_str().to_string();
            if method_name != "constructor" {
                Some(method_name)
            } else {
                None
            }
        })
        .collect()
}
