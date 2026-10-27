'use strict';
// Clues are original and avoid reproduced song lyrics.
const unpack=(s,era)=>s.trim().split('\n').map(line=>{const [prompt,correct,...wrong]=line.split('|');return {prompt,options:[correct,...wrong],answer:0,era}});
const general=unpack(`Which planet is known as the Red Planet?|Mars|Venus|Jupiter|Mercury
How many sides does a hexagon have?|Six|Five|Seven|Eight
What is the capital of the United States?|Washington, D.C.|New York|Boston|Philadelphia
Which ocean borders California?|Pacific|Atlantic|Indian|Arctic
What gas do plants absorb from the air?|Carbon dioxide|Helium|Hydrogen|Neon
How many minutes are in an hour?|60|30|45|100
Which branch of the U.S. government makes federal laws?|Legislative|Executive|Judicial|Military
What is water’s chemical formula?|H₂O|CO₂|O₂|NaCl
Which is the largest continent by land area?|Asia|Africa|North America|Europe
How many planets orbit the Sun?|Eight|Seven|Nine|Ten
What is 9 × 7?|63|56|72|81
Which animal is a mammal?|Dolphin|Shark|Salmon|Octopus
In which direction does the sun appear to rise?|East|North|South|West
What is the freezing point of water in Celsius?|0°|10°|32°|100°
Which U.S. document begins with the words “We the People”?|The Constitution|The Declaration of Independence|The Bill of Rights|The Emancipation Proclamation
Which state is known as the Lone Star State?|Texas|Florida|Ohio|Nevada
How many hours are in two days?|48|24|36|72
What is the largest ocean on Earth?|Pacific|Atlantic|Indian|Arctic
Which organ pumps blood around the body?|Heart|Lung|Liver|Kidney
What is 100 divided by 4?|25|20|30|40
Which star is closest to Earth?|The Sun|Sirius|Polaris|Betelgeuse
Which shape has three sides?|Triangle|Square|Pentagon|Circle
What is the capital of Texas?|Austin|Houston|Dallas|San Antonio
What process turns liquid water into water vapor?|Evaporation|Freezing|Condensation|Melting
How many U.S. senators are elected from each state?|Two|One|Three|Four
Which U.S. holiday is celebrated on July 4?|Independence Day|Thanksgiving|Memorial Day|Labor Day
Which fraction equals one half?|2/4|1/3|3/4|2/3
What is the nearest planet to the Sun?|Mercury|Mars|Earth|Neptune
Which instrument measures temperature?|Thermometer|Compass|Ruler|Scale
Which part of a plant usually absorbs water from soil?|Roots|Petals|Leaves|Fruit`,'general');
const movies=[...unpack(`Which film features a young lion named Simba?|The Lion King|Aladdin|Tarzan|Hercules
Which film follows a boy who discovers he is a wizard at Hogwarts?|Harry Potter and the Sorcerer's Stone|Matilda|The Chronicles of Narnia|The Princess Diaries
In which film does a toy cowboy named Woody appear?|Toy Story|Shrek|Cars|Monsters, Inc.
Which 1997 film features Jack and Rose aboard an ocean liner?|Titanic|The Notebook|Pearl Harbor|Romeo + Juliet
Which movie features the ogre Shrek and a talkative donkey?|Shrek|Madagascar|The Incredibles|Ice Age
Which film features a superhero called Black Panther in Wakanda?|Black Panther|Iron Man|Thor|Ant-Man
Which film follows a fashion assistant working for Miranda Priestly?|The Devil Wears Prada|Legally Blonde|Mean Girls|Clueless
Which film features a young girl named Dorothy visiting Oz?|The Wizard of Oz|Mary Poppins|The Sound of Music|Peter Pan
Which 1977 film introduced Luke Skywalker?|Star Wars|Star Trek|Dune|Alien
Which film features a theme park populated by cloned dinosaurs?|Jurassic Park|Jumanji|Godzilla|King Kong
Which film follows Marty McFly and a time-traveling DeLorean?|Back to the Future|E.T.|The Goonies|Ghostbusters
Which film centers on an alien who befriends a boy named Elliott?|E.T. the Extra-Terrestrial|Close Encounters of the Third Kind|The Iron Giant|Flight of the Navigator`, 'mixed'),...unpack(`Which 1972 film follows the Corleone crime family?|The Godfather|Rocky|Jaws|Chinatown
Which film features a shark terrorizing Amity Island?|Jaws|Alien|The Birds|King Kong
Which 1984 film features paranormal investigators in New York?|Ghostbusters|Beetlejuice|Gremlins|The Goonies
Which film features boxer Rocky Balboa?|Rocky|Raging Bull|The Karate Kid|Creed
Which 1980 film features the characters Jake and Elwood Blues?|The Blues Brothers|Trading Places|Coming to America|Beverly Hills Cop
Which film follows a teenager learning karate from Mr. Miyagi?|The Karate Kid|Footloose|Dirty Dancing|Top Gun
Which film features the character Indiana Jones searching for a lost ark?|Raiders of the Lost Ark|Romancing the Stone|The Mummy|National Treasure
Which 1986 film features naval aviator Maverick?|Top Gun|An Officer and a Gentleman|Platoon|The Right Stuff
Which musical film stars Julie Andrews as Maria and features the von Trapp family?|The Sound of Music|Mary Poppins|Grease|My Fair Lady
Which 1987 film features a bride named Buttercup and a hero named Westley?|The Princess Bride|Labyrinth|Willow|Legend
Which 1988 movie follows a boy who becomes an adult overnight?|Big|Splash|Home Alone|Mrs. Doubtfire
Which 1964 film features the nanny Mary Poppins?|Mary Poppins|Bedknobs and Broomsticks|Annie|Oliver!`, 'classic'),...unpack(`Which film features sisters Anna and Elsa in Arendelle?|Frozen|Moana|Brave|Tangled
Which 2023 movie follows a doll who travels to the real world?|Barbie|Enchanted|Maleficent|Cinderella
Which film features a young musician named Miguel visiting the Land of the Dead?|Coco|Encanto|Soul|Luca
Which 2018 film features the superhero Miles Morales?|Spider-Man: Into the Spider-Verse|The Incredibles|Big Hero 6|The Lego Movie
Which film features a Polynesian heroine sailing with Maui?|Moana|Raya and the Last Dragon|Frozen|Brave
Which film features a young girl named Mirabel in the magical Madrigal family?|Encanto|Coco|Turning Red|Luca
Which 2015 film depicts emotions inside a girl named Riley?|Inside Out|Soul|Up|Turning Red
Which film features a rabbit police officer named Judy Hopps?|Zootopia|Sing|The Bad Guys|Pets
Which 2022 film features a fighter pilot nicknamed Maverick?|Top Gun: Maverick|Devotion|Dunkirk|Air
Which 2023 film follows physicist J. Robert Oppenheimer?|Oppenheimer|The Theory of Everything|Hidden Figures|A Beautiful Mind
Which film features the Marvel hero Shang-Chi?|Shang-Chi and the Legend of the Ten Rings|Doctor Strange|Ant-Man|Thor
Which 2024 film revisits Riley's emotions as she becomes a teenager?|Inside Out 2|Elemental|Soul|Luca`, 'new')];
const music=[...unpack(`Which singer released the album Thriller?|Michael Jackson|Prince|Stevie Wonder|Lionel Richie
Which group released the album Abbey Road?|The Beatles|Queen|The Rolling Stones|ABBA
Who is known as the Queen of Soul?|Aretha Franklin|Dolly Parton|Madonna|Cher
Which singer released Purple Rain?|Prince|Elton John|David Bowie|George Michael
Which group recorded Dancing Queen?|ABBA|Bee Gees|Fleetwood Mac|The Supremes
Who released the album Like a Virgin?|Madonna|Whitney Houston|Cyndi Lauper|Tina Turner
Which band featured Freddie Mercury as lead singer?|Queen|U2|The Police|The Eagles
Which singer released the album Songs in the Key of Life?|Stevie Wonder|Marvin Gaye|Ray Charles|James Brown
Which singer was known as the King of Rock and Roll?|Elvis Presley|Chuck Berry|Buddy Holly|Johnny Cash
Which singer released What's Going On in 1971?|Marvin Gaye|Al Green|Sam Cooke|Otis Redding
Which singer recorded I Will Always Love You for The Bodyguard soundtrack?|Whitney Houston|Mariah Carey|Janet Jackson|Toni Braxton
Which group recorded Stayin' Alive?|Bee Gees|Earth, Wind & Fire|ABBA|The Temptations`, 'classic'),...unpack(`Which group released the album The Writing's on the Wall?|Destiny's Child|TLC|SWV|En Vogue
Which singer released the album The Miseducation of Lauryn Hill?|Lauryn Hill|Erykah Badu|Aaliyah|Brandy
Which singer released the album Confessions in 2004?|Usher|Ne-Yo|Chris Brown|Akon
Which artist released the album The College Dropout?|Kanye West|Jay-Z|Drake|Kendrick Lamar
Which singer released the album The Emancipation of Mimi?|Mariah Carey|Beyoncé|Alicia Keys|Ciara
Which group released the album No Scrubs appears on?|TLC|Destiny's Child|En Vogue|Salt-N-Pepa
Which artist released the album Miss E... So Addictive?|Missy Elliott|Lil' Kim|Queen Latifah|Eve
Which singer released the album FutureSex/LoveSounds?|Justin Timberlake|Justin Bieber|Bruno Mars|Usher
Which singer released the album Dangerously in Love?|Beyoncé|Rihanna|Alicia Keys|Ashanti
Which rapper released The Blueprint in 2001?|Jay-Z|Nas|Nelly|Ludacris
Which artist released the 1999 album ...Baby One More Time?|Britney Spears|Christina Aguilera|Pink|Jessica Simpson
Which singer released the album Songs in A Minor?|Alicia Keys|India.Arie|Mary J. Blige|Sade`, 'millennial'),...unpack(`Which artist released the album Renaissance in 2022?|Beyoncé|Rihanna|Adele|SZA
Which singer released the album 1989?|Taylor Swift|Olivia Rodrigo|Katy Perry|Lady Gaga
Which artist released the album SOS in 2022?|SZA|Doja Cat|H.E.R.|Summer Walker
Which artist released the album After Hours?|The Weeknd|Bruno Mars|Drake|Frank Ocean
Which rapper released the album Good Kid, M.A.A.D City?|Kendrick Lamar|J. Cole|Drake|Future
Which artist released the album Sour?|Olivia Rodrigo|Billie Eilish|Ariana Grande|Dua Lipa
Which artist released the album 25?|Adele|Lorde|Sia|Lana Del Rey
Which singer released the album Future Nostalgia?|Dua Lipa|Ariana Grande|Miley Cyrus|Halsey
Which artist released the album Cowboy Carter?|Beyoncé|Kacey Musgraves|Taylor Swift|Maren Morris
Which artist released the album Un Verano Sin Ti?|Bad Bunny|J Balvin|Maluma|Rauw Alejandro
Which singer released the album When We All Fall Asleep, Where Do We Go?|Billie Eilish|Lorde|Sabrina Carpenter|Tate McRae
Which artist released the album Ctrl?|SZA|Doja Cat|Summer Walker|H.E.R.`, 'new')];
// Millennial movies include the 90s/2000s entries from the mixed set.
movies.push(...movies.filter(q=>q.era==='mixed'&&!q.prompt.includes('1977')&&!q.prompt.includes('Dorothy')&&!q.prompt.includes('Black Panther')).map(q=>({...q,era:'millennial'})));
// Supplement Millennial movie set to at least ten distinct questions.
movies.push(...unpack(`Which film features a teenage girl named Cady navigating a high-school clique?|Mean Girls|Clueless|Easy A|Heathers
Which film follows Elle Woods as she attends Harvard Law School?|Legally Blonde|Miss Congeniality|The Princess Diaries|Bring It On
Which film features the character Neo and a simulated reality?|The Matrix|Inception|Minority Report|Avatar
Which 2003 film features a fish named Nemo?|Finding Nemo|Shark Tale|A Bug's Life|Happy Feet`, 'millennial'));
const profiles=[
 ['What is your go-to music vibe?',['R&B','Hip-Hop','Pop','Country']],
 ['What is your ideal Friday night?',['Going out','Staying home','Dinner with friends','A spontaneous adventure']],
 ['Which drink would you pick?',['Margarita','Mocktail','Wine','Beer']],
 ['What would you rather spend money on?',['Travel','Food','Clothes','Concerts']],
 ['Which is your biggest pet peeve?',['People being late','Loud chewing','Bad communication','Messiness']],
 ['What is your dream vacation?',['Tropical beach','European city','Mountain getaway','Luxury cruise']],
 ['Which dating red flag would you notice first?',['Poor communication','Dishonesty','Unreliability','Bad manners']],
 ['What would you do with an unexpected $1,000?',['Go shopping','Save it','Book a trip','Treat my friends']],
 ['How would you most enjoy celebrating?',['Dinner out','House party','Weekend getaway','Quiet night in']],
 ['What role do you usually play in the group?',['The planner','The spontaneous one','The comedian','The laid-back friend']]
].map(([prompt,options])=>({prompt,options}));
const {generatedMovies,generatedMusic,extraGeneral}=require('./extra-questions');
movies.push(...generatedMovies);music.push(...generatedMusic);general.push(...extraGeneral);
for (const q of music) if(q.prompt.includes('for The Bodyguard soundtrack')) q.era='millennial';
module.exports={general,movies,music,profiles};
