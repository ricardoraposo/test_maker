let split_lines lines  =
  let rec aux list acc =
    match list with
    | [] -> List.rev acc
    | hd :: tl -> 
        let words = List.rev (String.split_on_char ' ' (String.trim hd)) in
        aux tl (words @ acc)
  in aux lines [];;

let remove_last s = String.sub s 0 (String.length s - 1)

let find_constructor words =
    let rec aux list acc =
    match list with
    | [] -> acc 
    | word :: rest -> 
      match word with
      | "constructor(" -> 
        let rec find_class class_words class_acc =
          match class_words with
          | [] -> aux rest class_acc
          | hd :: tl -> 
            match hd with
            | ")" -> class_acc @ aux rest acc
            | "private" -> find_class tl class_acc
            | "readonly" -> find_class tl class_acc
            | _  -> remove_last hd :: find_class tl class_acc
        in find_class rest []
      | _ -> aux rest acc
  in aux words [];;


let rec pair_up list =
  match list with
  | [] -> []
  | [el] -> [(el, "")]
  | x1 :: x2 :: tl -> (x1, x2) :: pair_up tl;;
