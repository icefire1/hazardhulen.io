# HazardHulen.IO

## Technoly ##
The client is written in HTML and jQuery, which uses socket.io to connect to the server.

The server is written in JavaScript and uses socket.io to communicate with the clients.

https is used to ensure a safe connection between the host and the clients

## UML Sequence Diagram
![UML Sequence Diagram](https://github.com/DrBumlehund/off_the_books/blob/master/Documentation/sequence.png "UML Sequence Diagram")
The sequence diagram, shown above, shows all calls made between the server and the client.

The server is responsible for synchronizing the table across all clients. It uses the table object _(as seen in the object diagram below)_ for this, in the updateTable method.

## UML Object Diagram
![UML Class Diagram](https://github.com/DrBumlehund/off_the_books/blob/master/Documentation/ClassDiag.png "UML Class Diagram")
The object diagram contains the two key objects used un this project, _Table_ and _Player_.

\* The types set in the fields in the objects, are not according to UML standards. 
