open Test_maker

let () =
  let file = Sys.argv.(1) in
  let lines = File.read_file (file) in
  let parsed_lines = Parser.split_lines lines in
  let imports = Parser.find_constructor parsed_lines in
  let import_tuples = Helper.pair_up imports in
  let import_methods = Parser.fetch_methods import_tuples parsed_lines in
  Helper.print_tuple_list import_methods
