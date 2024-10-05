open Test_maker

let print_tuples (a,b) =
Printf.printf "(%s, %s)\n" a b

let () =
  let file = Sys.argv.(1) in
  let lines = File.read_file (file) in
  let parsed_lines = Parser.split_lines lines in
  let imports = Parser.find_constructor parsed_lines in
  List.iter print_tuples (Parser.pair_up imports)
