#!/python/python
import cgi
import os
import subprocess as sub

print 'Content-Type: application/json'
#DEBUG
#print 'Content-Type: text/html' 
#import cgitb
#cgitb.enable()
print #Required - ends HTTP headers

#GET parameters
GET = cgi.FieldStorage()
p1 = GET['p1'].value
p2 = GET['p2'].value
turn = GET['turn'].value

#Run native executable process
appDir = 'C:/www/tork5/cpp/tork5/x64/Release'
app = 'tork5.exe'
appPath = os.path.join(appDir, app)
cmd = [app, p1, p2, turn]

output = sub.Popen(cmd, executable=appPath, stdout=sub.PIPE).stdout.read()
#print output
#Extract output from executable - output as json
startPos = output.index('{')
endPos = output.index('}', startPos);
json = output[startPos:endPos + 1]
print json;