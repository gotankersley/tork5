java -jar c:\src\gclosure.jar --compilation_level SIMPLE_OPTIMIZATIONS ^
--js c:\www\tork5\js\data\avail-wins.js ^
--js c:\www\tork5\js\data\win-meta.js ^
--js c:\www\tork5\js\data\mid-wins.js ^
--js c:\www\tork5\js\lib\bitlib.js ^
--js c:\www\tork5\js\core\board.js ^
--js c:\www\tork5\js\core\game.js ^
--js_output_file c:\Users\Glen\Dropbox\Public\tork5\js\tork5.min.js

rem java -jar c:\src\yuicompressor.jar c:\www\tork5\css\tork5.css -o c:\Users\Glen\Dropbox\Public\tork5\css\tork5.min.css