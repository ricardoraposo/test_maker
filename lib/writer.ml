open File
open Helper

let make_test_file filename =
  replace_last_three_chars filename ".spec.ts";;

let write_header filename subject = 
  write_to_file ~filename:(make_test_file filename) ~message:(Printf.sprintf "describe('%s', () => {\n  let %s: %s" subject "subject" subject);;

let write_let_statements f params =
  List.iter (
    fun x -> 
      let var, class_name, _ = x in
      let message = Printf.sprintf "  let %s: %s" var class_name in
      write_to_file ~filename:(make_test_file f) ~message:message
  ) params;;

let write_mocks f params subject =
  write_to_file ~filename:(make_test_file f) ~message:(Printf.sprintf "\n  beforeEach(async () => {\n    const module: TestingModule = await Test.createTestingModule({\n      providers: [\n        %s," subject);
  List.iter (
    fun param -> 
    let _, class_name, methods = param in
    let message = Printf.sprintf "        {\n          provide: %s,\n          useValue: {" class_name in
    write_to_file ~filename:(make_test_file f) ~message:message;
    List.iter (fun method_name ->
      let message = Printf.sprintf "            %s: vi.fn()," method_name in
      write_to_file ~filename:(make_test_file f) ~message:message
    ) methods;
    write_to_file ~filename:(make_test_file f) ~message:"          },\n        },";
  ) params;
  write_to_file ~filename:(make_test_file f) ~message:"      ],\n    }).compile()\n";;

let write_modules_gets f params subject =
  write_to_file ~filename:(make_test_file f) ~message:(Printf.sprintf "    subject = module.get<%s>(%s)" subject subject);
  List.iter (
    fun x -> 
      let var, class_name, _ = x in
      let message = Printf.sprintf "    %s = module.get<%s>(%s)" var class_name class_name in
      write_to_file ~filename:(make_test_file f) ~message:message
  ) params;
  write_to_file ~filename:(make_test_file f) ~message:"  })\n\n  describe('these are gonna be really cool tests', () => {})\n})";;
;;
