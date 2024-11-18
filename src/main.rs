use std::{
    env,
    fs::{self, OpenOptions},
};

mod code_gen;
mod helper;
mod parser;

fn main() {
    let args: Vec<String> = env::args().collect();

    let file_path = args.get(1);

    let path = match file_path {
        Some(path) => path,
        None => {
            println!("No path provided");
            return;
        }
    };

    let file = fs::read_to_string(path).expect("Failed reading file");

    let modules = match parser::get_modules(&file) {
        Some(m) => m,
        None => {
            println!("No constructor found");
            return;
        }
    };

    let name = match parser::get_main_name(&file) {
        Some(name) => name,
        None => {
            println!("No constructor found");
            return;
        }
    };

    let function_calls = parser::get_methods(&file, modules);

    let filepath = helper::replace_last_three(path, ".spec.ts");

    let buffer = OpenOptions::new().append(true).create(true).open(filepath);

    match buffer {
        Ok(buffer) => {
            code_gen::write_header(&buffer, &name);
            code_gen::write_let_statements(&buffer, &function_calls);
            code_gen::write_mocks(&buffer, &function_calls, &name);
            code_gen::write_module_gets(&buffer, &function_calls, &name);

            println!("Obrigado, Raposo e fe!!!")
        }
        Err(_) => {
            println!("Failed reading dest. file")
        }
    }
}
