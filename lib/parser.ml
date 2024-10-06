let remove_last s = String.sub s 0 (String.length s - 1)

let split_lines lines  =
  let rec aux list acc =
    match list with
    | [] -> List.rev acc
    | hd :: tl -> 
        let words = List.rev (String.split_on_char ' ' (String.trim hd)) in
        aux tl (words @ acc)
  in aux lines [];;


let should_ignore token =
  match token with
  | "readonly"
  | "private" -> true
  | _ -> false;;

let find_constructor tokens =
  let rec process_tokens tokens acc =
    match tokens with
    | [] -> acc
    | token :: rest ->
      match token with
      | "constructor(" | "constructor(private" -> 
        let rec extract_constructor_params params_acc remaining_tokens =
          match remaining_tokens with
            (* Return to main loop *)
          | [] -> process_tokens rest (List.rev params_acc @ acc) 
          | hd :: tl -> 
            match hd with
            (* Return to main loop *)
            | ")" -> process_tokens rest (List.rev params_acc @ acc)
            (* Ignore *)
            | hd when should_ignore hd -> extract_constructor_params params_acc tl
            (* Return to main loop with hd *)
            | hd when String.contains hd ')' -> process_tokens rest (List.rev (remove_last hd :: params_acc)  @ acc)
            (* Get param *)
            | _ -> extract_constructor_params (remove_last hd :: params_acc) tl
        in
        extract_constructor_params [] rest
      | _ -> process_tokens rest acc
  in
  process_tokens tokens [];;

let clean_param param input =
  let regex = Re.compile Re.(seq [str "this."; str param;str "."; group(rep1 alpha); str "("]) in
  try
    let result = Re.exec regex input in
    Re.Group.get result 1
  with Not_found ->
    input;;

let fetch_methods params tokens =
  let find_methods var token_list =
    let regex = Re.compile Re.(seq [str "this."; str var]) in
    List.filter (fun token -> Re.execp regex token) token_list
  in
  let process_param (var, class_name) =
    let method_calls = find_methods var tokens in
    let methods = (List.map (fun x -> clean_param var x) method_calls) in
    (var, class_name, List.rev (Helper.remove_duplicates methods ))
  in
  List.map process_param params
