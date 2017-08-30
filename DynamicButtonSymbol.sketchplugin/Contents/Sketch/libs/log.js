debugObject = function(obj, debugLogPath) {
    var newline       = "\r\n";
    var doubleNewLine = newline + newline;


    var output = 'Dump for object:' + obj + newline + 'Class: ' + [obj class] + newline
        + '#####################################################################################' + doubleNewLine

        + '### Properties' + newline + [obj class].mocha().properties() + doubleNewLine

        + '### Properties With Ancestors' + newline + [obj class].mocha().propertiesWithAncestors() + doubleNewLine

        + '### Methods' + newline + [obj class].mocha().classMethods() + doubleNewLine

        + '### Methods With Ancestors' + newline + [obj class].mocha().classMethodsWithAncestors() + doubleNewLine

        + '### Instance Methods' + newline + [obj class].mocha().instanceMethods() + doubleNewLine

        + '### Instance Methods With Ancestors' + newline + [obj class].mocha().instanceMethodsWithAncestors() + doubleNewLine

        + '### Protocols' + newline + [obj class].mocha().protocols() + doubleNewLine

        + '### Protocols With Ancestors' + newline + [obj class].mocha().protocolsWithAncestors() + doubleNewLine

        + '### Tree As Dictionary' + newline + obj.treeAsDictionary() + doubleNewLine;

    // Create  folder if it doesn't exist
    var FolderPath = debugLogPath;
    [[NSFileManager defaultManager] createDirectoryAtPath:FolderPath withIntermediateDirectories:true attributes:nil error:nil]

    // Write log to the  file
    var outputNSString = [NSString stringWithFormat:"%@", output];
    var logPath = debugLogPath + '/debug.log';
    [outputNSString writeToFile:logPath atomically:true encoding:NSUTF8StringEncoding error:nil];
};