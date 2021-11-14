USE `jeopardy`;

DROP TABLE IF EXISTS `questions`;

CREATE TABLE `questions` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `answer_a` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `answer_b` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `answer_c` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `answer_d` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correct_answer` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `points` int(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
); 

INSERT INTO questions VALUES (1, 'geography', 'What is the capital of Afghanistan?', 'Tirana', 'Kabul', 'Dushanbe', 'Tashkent', 'Kabul', 10);
INSERT INTO questions VALUES (2, 'geography', 'What is the capital of Australia?', 'Canberra', 'Sydney', 'Melbourne', 'Ottawa', 'Canberra', 20);
INSERT INTO questions VALUES (3, 'geography', 'What is the capital of Belgium?', 'Amsterdam', 'Luxemburg', 'Brussels', 'Stockholm', 'Brussels', 30);
INSERT INTO questions VALUES (4, 'geography', 'What is the capital of Greece?', 'Ankara', 'Athens', 'Sofia', 'Thessaloniki', 'Athens', 40);
INSERT INTO questions VALUES (5, 'geography', 'What is the capital of Italy?', 'Venice', 'Rome', 'Naples', 'Milan', 'Rome', 50);

INSERT INTO questions VALUES (6, 'animals', 'Three of these animals hibernate. Which one does not?', 'Mouse', 'Sloth', 'Frog', 'Snake', 'Sloth', 10);
INSERT INTO questions VALUES (7, 'animals', 'All of these animals are omnivorous except one.', 'Fox', 'Mouse', 'Opossum', 'Snail', 'Snail', 20);
INSERT INTO questions VALUES (8, 'animals', 'Three of these Latin names are names of bears. Which is the odd one?', 'Melursus ursinus', 'Helarctos malayanus', 'Ursus minimus', 'Felis silvestris catus', 'Felis silvestris catus', 30);
INSERT INTO questions VALUES (9, 'animals', 'These are typical Australian animals except one.', 'Platypus', 'Dingo', 'Echidna', 'Sloth', 'Sloth', 40);
INSERT INTO questions VALUES (10, 'animals', 'Representatives of three of these species produce venom of their own. Which is the odd species?', 'Lizards', 'Scorpions', 'Frogs', 'Mosquitos', 'Mosquitos', 50);

INSERT INTO questions VALUES (11, 'movies', 'I would rather be a ghost drifting by your side as a condemned soul than enter heaven without you. Because of your love, I will never be a lonely spirit. (2000)', 'Don Juan DeMarco', 'Ever After', 'Crouching Tiger, Hidden Dragon', 'Dracula', 'Crouching Tiger, Hidden Dragon', 10);
INSERT INTO questions VALUES (12, 'movies', 'There are only four questions of value in life. What is sacred? Of what is the spirit made of? What is worth living for? What is worth dying for? The answer to each is the same. Only love. (1995)', 'When Harry Met Sally', 'Don Juan DeMarco', 'Cant Hardly Wait', 'Ten Things I Hate About You', 'Don Juan DeMarco', 20);
INSERT INTO questions VALUES (13, 'movies', 'I have crossed oceans of time to find you. (1992)', 'Moulin Rouge', 'Notting Hill', 'A Knights Tale', 'Dracula', 'Dracula', 30);
INSERT INTO questions VALUES (14, 'movies', 'I came here tonight because when you realize you want to spend the rest of your life with somebody, you want the rest of your life to start as soon as possible. (1989)', 'When Harry Met Sally', 'Wuthering Heights', 'Youve Got Mail', 'The Mask of Zorro', 'When Harry Met Sally', 40);
INSERT INTO questions VALUES (15, 'movies', 'Love has given me wings so I must fly. (2001)', 'A Knights Tale', 'Phenomenon', 'Ever After', 'Forget Paris', 'A Knights Tale', 50);

INSERT INTO questions VALUES (16, 'science', 'Immanuel Kant criticized Emanuel Swedenborg and termed him a “spook hunter”.', 'True', 'False', '', '', 'True', 10);
INSERT INTO questions VALUES (17, 'science', 'Clouds are made up of these.', 'Carbon atoms', 'Water droplets and ice crystals', 'Oxygen ions', 'Dust mites', 'Water droplets and ice crystals', 20);
INSERT INTO questions VALUES (18, 'science', 'This formation is a conical hill or mountain. It is formed by mantle material being pressed through an opening in the Earths crust.', 'A volcano', 'A hill', 'An earthquake', 'A geyser', 'A volcano', 30);
INSERT INTO questions VALUES (19, 'science', 'Japan suffers from this event very often. It is the sudden, light or violent movement of the earths surface caused by the release of energy in the earths crust.', 'Volcano', 'Earthquake', 'Tide', 'Tsunami', 'Earthquake', 40);
INSERT INTO questions VALUES (20, 'science', 'It is the only continent that does not have land areas below sea level.', 'Australia', 'South America', 'Antarctica', 'Arctica', 'Antarctica', 50);

INSERT INTO questions VALUES (21, 'music', 'The controversial lyrics of this song by The Rolling Stones include, Its Down to me, the way she talks when shes spoken to', 'Heart of Stone', 'Under My Thumb', 'Play With Fire', 'Its All Over Now', 'Under My Thumb', 10);
INSERT INTO questions VALUES (22, 'music', 'Mick Jagger sings Baby, baby, theres fever in the funk house now on this song.', 'Tumbling Dice', 'Gimme Shelter', 'Street Fighting Man', 'Jumpin Jack Flash', 'Tumbling Dice', 20);
INSERT INTO questions VALUES (23, 'music', 'Lose Your Dreams and you will lose your mind are lyrics from this 1967 hit by The Rolling Stones.', 'As Tears Go By', '(I Cant Get No) Satisfaction', 'Shes A Rainbow', 'Ruby Tuesday', 'Ruby Tuesday', 30);
INSERT INTO questions VALUES (24, 'music', 'Tommy Lee, Vince Neil, Nikki Sixx, Mick Mars', 'Poison', 'Great White', 'Whitesnake', 'Motley Crue', 'Motley Crue', 40);
INSERT INTO questions VALUES (25, 'music', 'Audie Desbrow, Jack Russell, Michael Lardie, Tony Montana, Mark Kendall', 'Motley Crue', 'Poison', 'Great White', 'Whitesnake', 'Great White', 50);

INSERT INTO questions VALUES (26, 'television', 'Gilbert (Gil) Arthur Grissom is the night shift team supervisor from this TV show.', 'The City', 'CSI: Crime Scene Investigation', 'CSI: New York', 'CSI: Miami', 'CSI: Crime Scene Investigation', 10);
INSERT INTO questions VALUES (27, 'television', 'Jack Bauer, Nina Myers and George Mason are three of the characters of this TV series.', '24', '3 South', '60 Minutes', '20/20', '24', 20);
INSERT INTO questions VALUES (28, 'television', 'Harry Solomon, Dick Solomon and Dr. Mary Albright.', 'Battlestar Galactica', '3rd Rock from the Sun', 'The A-Team', '7th Heaven', '3rd Rock from the Sun', 30);
INSERT INTO questions VALUES (29, 'television', 'The annoying neighbours, the Ochmoneks are from this TV show.', 'Dawsons Creek', 'ALF', 'Beverly Hills 90210', 'All My Children', 'ALF', 40);
INSERT INTO questions VALUES (30, 'television', 'Where does the cartoon character SpongeBob work?', 'Krusty Krab', 'Chum Bucket', 'Tuff Tavern', 'Beach Bums', 'Krusty Krab', 50);
