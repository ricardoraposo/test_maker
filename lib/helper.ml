let print_tuples (a,b) =
  Printf.printf "(%s, %s)\n" a b;;

(* Function to convert a string list to a single string *)
let string_of_string_list lst =
  "[" ^ (String.concat "; " lst) ^ "]"

(* Function to print (string * string * string list) list *)
let print_tuple_list lst =
  List.iter (fun (var, class_name, methods) ->
    let methods_str = string_of_string_list methods in
    Printf.printf "(%s, %s, %s)\n" var class_name methods_str
  ) lst

let rec pair_up list =
  match list with
  | [] -> []
  | [el] -> [(el, "")]
  | x1 :: x2 :: tl -> (x1, x2) :: pair_up tl;;

let remove_duplicates lst =
  let rec aux seen acc = function
    | [] -> List.rev acc
    | hd :: tl ->
      if List.mem hd seen then
        aux seen acc tl  (* Skip if already seen *)
      else
        aux (hd :: seen) (hd :: acc) tl  (* Add to seen and result *)
  in
  aux [] [] lst;;
