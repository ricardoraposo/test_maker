val split_lines: string list -> string list

val find_constructor: string list -> string list

val get_main_class: string list -> string option

val fetch_methods: (string * string) list -> string list -> (string * string * string list) list
