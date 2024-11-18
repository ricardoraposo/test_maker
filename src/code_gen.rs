use crate::parser::Module;
use std::{fs::File, io::Write};

pub fn write_header(mut buf: &File, header_name: &str) {
    let header = format!(
        "describe('{}', () => {{\n  let subject: {}\n",
        header_name, header_name,
    );
    write!(buf, "{header}").unwrap()
}

pub fn write_let_statements(mut buf: &File, modules: &[Module]) {
    for module in modules {
        let st = format!("  let {}: {}\n", module.class.variable, module.class.name);
        write!(buf, "{st}").unwrap()
    }
}

pub fn write_mocks(mut buf: &File, modules: &[Module], main_class: &str) {
    write!(buf, "\n  beforeEach(async () => {{\n    const module: TestingModule = await Test.createTestingModule({{\n      providers: [\n        {main_class},").unwrap();

    for module in modules {
        let st = format!(
            "        {{\n          provide: {},\n          useValue: {{\n",
            module.class.name
        );
        write!(buf, "{st}").unwrap();

        for method in module.methods.clone() {
            let st = format!("            {}: vi.fn(),\n", method);
            write!(buf, "{st}").unwrap()
        }
        write!(buf, "          }},\n        }},\n").unwrap()
    }
    write!(buf, "      ],\n    }}).compile()\n").unwrap()
}

pub fn write_module_gets(mut buf: &File, modules: &[Module], main_class: &str) {
    writeln!(buf, "    subject = module.get<{main_class}>({main_class})").unwrap();

    for module in modules {
        let st = format!(
            "    {} = module.get<{}>({})\n",
            module.class.variable, module.class.name, module.class.name
        );
        write!(buf, "{st}").unwrap()
    }

    write!(buf, "  }})").unwrap();

    for module in modules {
        for function in &module.class.functions {
            write!(buf, "\n\n  describe('{function}', () => {{}})").unwrap();
        }
    }

    write!(buf, "\n}})").unwrap();
}
