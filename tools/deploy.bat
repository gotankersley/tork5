rem "java" -jar c:\src\gclosure.jar --compilation_level SIMPLE_OPTIMIZATIONS ^
"C:\Program Files (x86)\Java\jre7\bin\java" -jar c:\test\gclosure.jar --compilation_level SIMPLE_OPTIMIZATIONS ^
--js c:\www\tork5\js\lib\bitlib.js ^
--js c:\www\tork5\js\data\avail-wins.js ^
--js c:\www\tork5\js\data\win-meta.js ^
--js c:\www\tork5\js\data\quad-wins.js ^
--js c:\www\tork5\js\data\mid-wins.js ^
--js c:\www\tork5\js\constants\settings.js ^
--js c:\www\tork5\js\constants\player.js ^
--js c:\www\tork5\js\core\board.js ^
--js c:\www\tork5\js\core\player.js ^
--js c:\www\tork5\js\ai\mcts.js ^
--js c:\www\tork5\js\core\game.js ^
--js c:\www\tork5\js\main.js ^
--js_output_file c:\tmp\tork5.min.js

rem java -jar c:\src\yuicompressor.jar c:\www\tork5\css\tork5.css -o c:\Users\Glen\Dropbox\Public\tork5\css\tork5.min.css
