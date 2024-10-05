let read_file filename =
  let ic = open_in filename in
  let rec read_lines acc =
    try
      read_lines (input_line ic :: acc)
    with End_of_file -> close_in ic;
    List.rev acc
    in read_lines []
;;
