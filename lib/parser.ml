let remove_last s = String.sub s 0 (String.length s - 1)

let split_lines lines  =
  let rec aux list acc =
    match list with
    | [] -> List.rev acc
    | hd :: tl -> 
        let words = List.rev (String.split_on_char ' ' (String.trim hd)) in
        aux tl (words @ acc)
  in aux lines [];;

let find_constructor tokens =
  let rec process_tokens tokens acc =
    match tokens with
    | [] -> acc
    | token :: rest ->
      match token with
      | "constructor(" -> 
        let rec extract_constructor_params params_acc remaining_tokens =
          match remaining_tokens with
          | [] -> process_tokens rest (List.rev params_acc @ acc)
          | hd :: tl -> 
            match hd with
            | ")" -> process_tokens rest (List.rev params_acc @ acc)
            | "private" | "readonly" -> extract_constructor_params params_acc tl
            | _ -> extract_constructor_params (remove_last hd :: params_acc) tl
        in
        extract_constructor_params [] rest
      | _ -> process_tokens rest acc
  in
  process_tokens tokens []

let rec pair_up list =
  match list with
  | [] -> []
  | [el] -> [(el, "")]
  | x1 :: x2 :: tl -> (x1, x2) :: pair_up tl;;
