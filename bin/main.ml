open Test_maker

let () =
  let file = Sys.argv.(1) in
  let lines = File.read_file (file) in
  let parsed_lines = Parser.split_lines lines in
  let imports = Parser.find_constructor parsed_lines in
  let import_tuples = Helper.pair_up imports in
  let import_methods = Parser.fetch_methods import_tuples parsed_lines in

  match Parser.get_main_class lines with
  | None -> print_endline "Couldn't find main subject"
  | Some test_subject -> 
    Writer.write_header file test_subject;
    Writer.write_let_statements file import_methods;
    Writer.write_mocks file import_methods test_subject;
    Writer.write_modules_gets file import_methods test_subject;

    print_endline "Já agradeceu o raposo hoje?"
;;

