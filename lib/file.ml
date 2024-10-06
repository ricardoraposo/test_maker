let read_file filename =
  let ic = open_in filename in
  let rec read_lines acc =
    try
      read_lines (input_line ic :: acc)
    with End_of_file -> 
      close_in ic;
      List.rev acc
  in read_lines []
;;


let write_to_file ~filename ~message =
  let oc = open_out_gen [Open_append; Open_creat] 0o666 filename in
  Printf.fprintf oc "%s\n" message;
  close_out oc;
;;
