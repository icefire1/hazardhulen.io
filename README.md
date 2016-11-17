# HazardHulen.IO
_by: Anders Bundgaard, Casper Beese Nielsen, Oliver Vestergaard, Simon Hjortshøj Larsen, Steen Schütt & Thomas Lemqvist_

## The software
HazardHulen.io is a multiplayer blackjack table, where players can bet virtual
currency to participate in a round of blackjack. The game uses the same ruleset as
regular blackjack played in casinos, with a few details left out for simplicity.
Players play against an artificial intelligence which acts as the dealer, and win
double their bet if they beat the AI. If a player loses, his bet is lost.
All players get a set amount of virtual money when they join the table, and have
to place a bet of at least a minimum amount to play. If a player does not place
a bet within a certain time period in between rounds, he is labeled as inactive,
and cannot take part in the next round.

## Technology
This section describes the technologies used to implement this system.
### Client side
The client is written in HTML and jQuery, which uses socket.io to connect to the server.

### Server side
The server is written in JavaScript and uses socket.io to communicate with the clients.

## UML Sequence Diagram
![UML Sequence Diagram](https://github.com/DrBumlehund/off_the_books/blob/master/Documentation/sequence.png "UML Sequence Diagram")

The sequence diagram, shown above, shows all calls made between the server and the client.

The server is responsible for synchronizing the table across all clients. It uses the table object _(as seen in the object diagram below)_ for this, in the updateTable method.

## UML Object Diagram
![UML Class Diagram](https://github.com/DrBumlehund/off_the_books/blob/master/Documentation/ClassDiag.png "UML Class Diagram")

The object diagram contains the two key objects used in this project, _Table_ and _Player_.

\* The types set in the fields in the objects, are not according to UML standards.

## Walkthrough of Key code-snippets

## How to run
To run the server, you have to have npm (it can be downloaded along with node here: https://nodejs.org/en/download/).
npm is a package manager for Node. It npm is used to install bower, and other plugins, but most importantly bower.

Run this in the command line to install bower: (from: https://bower.io)
``` sh
    $ npm install -g bower
```
To start the server, now you simply just has to run the following command.
``` sh
    $ npm start
```

Now the server should be up and running.

To connect a client to the server, go to http://localhost:13337

## References
#### npm Packages
* https://nodejs.org/en/download/
* https://bower.io
* https://lodash.com
* http://socket.io
* https://www.npmjs.com/package/monolog
#### Helpful Links
* http://www.programwitherik.com/socket-io-tutorial-with-node-js-and-express/
#### Information about Blackjack
* https://en.wikipedia.org/wiki/Blackjack
