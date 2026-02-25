--
-- PostgreSQL database dump
--

\restrict yEvlbJk2z5yI4zSaQhkbNQyOpnrEUV0YYVwV7efVUQ2FNRudG2yHE94wPxRMHsi

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cards (
    id integer NOT NULL,
    text text NOT NULL,
    type text NOT NULL,
    pick integer DEFAULT 1,
    pack text DEFAULT 'base'::text
);


ALTER TABLE public.cards OWNER TO postgres;

--
-- Name: cards_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cards_id_seq OWNER TO postgres;

--
-- Name: cards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cards_id_seq OWNED BY public.cards.id;


--
-- Name: games; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.games (
    id integer NOT NULL,
    guild_id text NOT NULL,
    channel_id text NOT NULL,
    status text DEFAULT 'waiting'::text NOT NULL,
    judge_id text,
    current_black_card_id integer,
    created_at timestamp without time zone DEFAULT now(),
    points_to_win integer DEFAULT 5 NOT NULL
);


ALTER TABLE public.games OWNER TO postgres;

--
-- Name: games_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.games_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.games_id_seq OWNER TO postgres;

--
-- Name: games_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.games_id_seq OWNED BY public.games.id;


--
-- Name: hands; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hands (
    id integer NOT NULL,
    player_id integer NOT NULL,
    card_id integer NOT NULL
);


ALTER TABLE public.hands OWNER TO postgres;

--
-- Name: hands_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hands_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hands_id_seq OWNER TO postgres;

--
-- Name: hands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hands_id_seq OWNED BY public.hands.id;


--
-- Name: played_cards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.played_cards (
    id integer NOT NULL,
    game_id integer NOT NULL,
    player_id integer NOT NULL,
    card_id integer NOT NULL
);


ALTER TABLE public.played_cards OWNER TO postgres;

--
-- Name: played_cards_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.played_cards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.played_cards_id_seq OWNER TO postgres;

--
-- Name: played_cards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.played_cards_id_seq OWNED BY public.played_cards.id;


--
-- Name: players; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.players (
    id integer NOT NULL,
    game_id integer NOT NULL,
    user_id text NOT NULL,
    username text NOT NULL,
    score integer DEFAULT 0 NOT NULL,
    is_vip boolean DEFAULT false
);


ALTER TABLE public.players OWNER TO postgres;

--
-- Name: players_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.players_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.players_id_seq OWNER TO postgres;

--
-- Name: players_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.players_id_seq OWNED BY public.players.id;


--
-- Name: cards id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cards ALTER COLUMN id SET DEFAULT nextval('public.cards_id_seq'::regclass);


--
-- Name: games id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games ALTER COLUMN id SET DEFAULT nextval('public.games_id_seq'::regclass);


--
-- Name: hands id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hands ALTER COLUMN id SET DEFAULT nextval('public.hands_id_seq'::regclass);


--
-- Name: played_cards id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.played_cards ALTER COLUMN id SET DEFAULT nextval('public.played_cards_id_seq'::regclass);


--
-- Name: players id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players ALTER COLUMN id SET DEFAULT nextval('public.players_id_seq'::regclass);


--
-- Data for Name: cards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cards (id, text, type, pick, pack) FROM stdin;
17561	In the new Among Us update, the Impostor can now use _____ to kill.	black	1	base
17562	_____ + _____ = _____.	black	3	base
17563	_____ is a slippery slope that leads to _____.	black	2	base
17564	_____ would be woefully incomplete without _____.	black	2	base
17565	_____: good to the last drop.	black	1	base
17566	_____: kid tested, mother approved.	black	1	base
17567	_____: kid-tested, mother-approved.	black	1	base
17568	_____: Once you pop, the fun don't stop!	black	1	base
17569	_____? Jim'll fix it!	black	1	base
17570	_____? There's an app for that.	black	1	base
17571	_____? Yeah, nah.	black	1	base
17572	_____. Awesome in theory, kind of a mess in practice.	black	1	base
17573	_____. Betcha can't have just one!	black	1	base
17574	_____. High five, bro.	black	1	base
17575	_____. It's a trap!	black	1	base
17576	_____. That was so metal.	black	1	base
17577	_____. That's how I want to die.	black	1	base
17578	_____. That's why mums go to Iceland.	black	1	base
17579	★✰✰✰✰ Do NOT go here! Found _____ in my fettuccine alfredo!	black	1	base
17580	50% of all marriages end in _____.	black	1	base
17581	A recent laboratory study shows that undergraduates have 50% less sex after being exposed to _____.	black	1	base
17582	A remarkable new study has shown that chimps have evolved their own primitive version of _____.	black	1	base
17583	A romantic, candlelit dinner would be incomplete without _____.	black	1	base
17584	A successful job interview begins with a firm handshake and ends with _____.	black	1	base
17585	ABC presents: "_____: The Story of _____."	black	2	base
17586	After eight years in the White House, how is Obama finally letting loose?	black	1	base
17587	After four platinum albums and three Grammys, it's time to get back to my roots, to what inspired me to make music in the first place: _____.	black	1	base
17588	After Hurricane Katrina, Sean Penn brought _____ to all the people of New Orleans.	black	1	base
17589	After months of practice with _____, I think I'm finally ready for _____.	black	2	base
17590	After the earthquake, Sean Penn brought _____ to the people of Haiti.	black	1	base
17591	Air Canada guidelines now prohibit _____ on airplanes.	black	1	base
17592	Airport security guidelines now prohibit _____ on airplanes.	black	1	base
17593	Alternative medicine is now embracing the curative powers of _____.	black	1	base
17594	And the Academy Award for _____ goes to _____.	black	2	base
17595	And the BAFTA for _____ goes to _____.	black	2	base
17596	And what did you bring for show and tell?	black	1	base
17597	Anthropologists have recently discovered a primitive tribe that worships _____.	black	1	base
17598	Arby's: We Have _____.	black	1	base
17599	"Are you thinking what I'm thinking, B1? I think I am, B2: it's _____ time!"	black	1	base
17600	As my New Year's resolution, I vow to give up _____.	black	1	base
17601	As the mom of five rambunctious boys, I'm no stranger to _____.	black	1	base
17602	BILLY MAYS HERE FOR _____.	black	1	base
17603	Brought to you by Bud Light®, the Official Beer of _____.	black	1	base
17604	Brought to you by Molson Canadian, the Official Beer of _____.	black	1	base
17605	Brought to you by XXXX Gold, the Official Beer of _____.	black	1	base
17606	But before I kill you, Mr. Bond, I must show you _____.	black	1	base
17607	CBC presents "_____: the Story of _____."	black	2	base
17608	Channel 4 presents _____, the story of _____.	black	2	base
17609	Channel 5's new reality show features eight washed-up celebrities living with _____.	black	1	base
17610	Channel 9 is pleased to present its new variety show, "Hey Hey It's _____."	black	1	base
17611	Charades was ruined for me forever when my mom had to act out _____.	black	1	base
17612	Check me out, yo! I call this dance move "_____."	black	1	base
17613	Click Here for _____!!!	black	1	base
17614	Coming to Broadway this season, _____: The Musical.	black	1	base
17615	Coming to the West End this year, _____: The Musical.	black	1	base
17616	Crikey! I've never seen _____ like this before! Let's get a bit closer.	black	1	base
17617	CTV presents "_____: the Story of _____."	black	2	base
17618	Daddy, why is mommy crying?	black	1	base
17619	Dear Abby, I'm having some trouble with _____ and would like your advice.	black	1	base
17620	Dear Agony Aunt, I'm having some trouble with _____ and I need your advice.	black	1	base
17621	Dear Sir or Madam, We regret to inform you that the Office of _____ has denied your request for _____.	black	2	base
17622	Designers! For this week's challenge, you must make a dress designed for _____.	black	1	base
17623	Doctor, you've gone too far! The human body wasn't meant to withstand that amount of _____!	black	1	base
17624	Dude, do not go in that bathroom. There's _____ in there.	black	1	base
17625	Dudes. I just found out that _____ is _____.	black	2	base
17626	Due to a PR fiasco, Walmart no longer offers _____.	black	1	base
17627	During his childhood, Salvador Dali produced hundreds of paintings of _____.	black	1	base
17628	During his midlife crisis, my dad got really into _____.	black	1	base
17629	During Picasso's often-overlooked Brown Period, he produced hundreds of paintings of _____.	black	1	base
17630	During sex, I like to think about _____.	black	1	base
17631	Finally! A service that delivers _____ right to your door.	black	1	base
17632	For my next trick, I will pull _____ out of _____.	black	2	base
17633	Fun tip! When your man asks you to go down on him, try surprising him with _____ instead.	black	1	base
17634	Future historians will agree that _____ marked the beginning of America's decline.	black	1	base
17635	Having problems with _____? Try _____!	black	2	base
17636	"Here is the church Here is the steeple Open the doors And there is _____."	black	1	base
17637	Hey guys, welcome to Boston Pizza! Would you like to start the night off right with _____?	black	1	base
17638	Hey Reddit! I'm _____. Ask me anything.	black	1	base
17639	Holy shit! My video of _____ has ten million views!	black	1	base
17640	How am I maintaining my relationship status?	black	1	base
17641	How did I lose my virginity?	black	1	base
17642	Howdy, neighbor! I couldn't help but notice you struggling with _____. Need a hand?	black	1	base
17643	Hulu's new reality show features twelve hot singles living with _____.	black	1	base
17644	I do not know with what weapons World War III will be fought, but World War IV will be fought with _____.	black	1	base
17645	I drink to forget _____.	black	1	base
17646	I get by with a little help from _____.	black	1	base
17647	I got 99 problems but _____ ain't one.	black	1	base
17648	I know when that hotline bling, that can only mean one thing: _____.	black	1	base
17649	I learned the hard way that you can't cheer up a grieving friend with _____.	black	1	base
17650	I never truly understood _____ until I encountered _____.	black	2	base
17651	I spent my whole life working toward _____, only to have it ruined by _____.	black	2	base
17652	I wish I hadn't lost the instruction manual for _____.	black	1	base
17653	I'm going on a cleanse this week. Nothing but kale juice and _____.	black	1	base
17654	I'm Lebron James, and when I'm not slamming dunks, I love _____.	black	1	base
17655	I'm no doctor, but I'm pretty sure what you're suffering from is called "_____."	black	1	base
17656	I'm sorry, Professor, but I couldn't complete my homework because of _____.	black	1	base
17657	I'm Tony Robbins, and over the next sixty minutes I'm going to teach you how to harness the power of _____!	black	1	base
17658	I'm not like the rest of you. I’m too rich and busy for _____.	black	1	base
17659	If you can't be with the one you love, love _____.	black	1	base
17660	IF you like _____, YOU MIGHT BE A REDNECK.	black	1	base
17661	In a world ravaged by _____, our only solace is _____.	black	2	base
17662	In an attempt to reach a wider audience, the Smithsonian Museum of Natural History has opened an interactive exhibit on _____.	black	1	base
17663	In Australia, _____ is twice as big and twice as deadly.	black	1	base
17664	In Belmarsh Prison, word is you can trade 200 cigarettes for _____.	black	1	base
17665	In her latest feature-length film, Tracy Beaker struggles with _____ for the first time.	black	1	base
17666	In his new self-produced album, Kanye West raps over the sounds of _____.	black	1	base
17667	In his new summer comedy, Rob Schneider is _____ trapped in the body of _____.	black	2	base
17668	In Jordan Peele's new thriller, a young family discovers that _____ had really been _____ all along.	black	2	base
17669	In L.A. County Jail, word is you can trade 200 cigarettes for _____.	black	1	base
17670	In Michael Jackson's final moments, he thought about _____.	black	1	base
17671	In Rome, there are whisperings that the Vatican has a secret room devoted to _____.	black	1	base
17672	In the new Disney Channel Original Movie, Hannah Montana struggles with _____ for the first time.	black	1	base
17673	In the seventh circle of Hell, sinners must endure _____ for all eternity.	black	1	base
17674	In Wormwood Scrubs, word is you can trade 200 cigarettes for _____.	black	1	base
17675	Instead of coal, Father Christmas now gives the bad children _____.	black	1	base
17676	Instead of coal, Santa now gives the bad children _____.	black	1	base
17677	Introducing the amazing superhero/sidekick duo! It's _____ and _____!	black	2	base
17678	Introducing X-Treme Baseball! It's like baseball, but with _____!	black	1	base
17679	It’s a pity that kids these days are all getting involved with _____.	black	1	base
17680	Just once, I'd like to hear you say "Thanks, Mom. Thanks for _____."	black	1	base
17681	Just saw this upsetting video! Please retweet!! #stop_____	black	1	base
17682	Kids, I don't need drugs to get high. I'm high on _____.	black	1	base
17683	Life for American Indians was forever changed when the White Man introduced them to _____.	black	1	base
17684	Life was difficult for cavemen before _____.	black	1	base
17685	Lifetime® presents _____: the Story of _____.	black	2	base
17686	Lovin’ you is easy ’cause you're _____.	black	1	base
17687	Major League Baseball has banned _____ for giving players an unfair advantage.	black	1	base
17688	Mamma Mia. Here I go again. My my! How can I resist _____?	black	1	base
17689	Maybe she's born with it. Maybe it's _____.	black	1	base
17690	Men's Wearhouse: You're gonna like _____. I guarantee it.	black	1	base
17691	Military historians remember Alexander the Great for his brilliant use of _____ against the Persians.	black	1	base
17692	Mitch McConnell can't cum without _____.	black	1	base
17693	Money can't buy me love, but it can buy me _____.	black	1	base
17694	Mr. and Mrs. Diaz, we called you in because we're concerned about Cynthia. Are you aware that your daughter is _____?	black	1	base
17695	My favorite sex position is called "_____-style."	black	1	base
17696	My fellow Americans: Before this decade is out, we will have _____ on the moon!	black	1	base
17697	My mom freaked out when she looked at my browser history and found _____.com/_____.	black	2	base
17698	My name is Peter Parker. I was bitten by a radioactive spider, and now I'm _____.	black	1	base
17699	My plan for world domination begins with _____.	black	1	base
17700	Next from J.K. Rowling: Harry Potter and the Chamber of _____.	black	1	base
17701	Now at the Smithsonian: an interactive exhibit on _____.	black	1	base
18056	A web of lies.	white	1	base
17702	O Canada, we stand on guard for _____.	black	1	base
17703	Oi! Show us _____!	black	1	base
17704	Old MacDonald had _____. E-I-E-I-O.	black	1	base
17705	Only two things in life are certain: death and _____.	black	1	base
17706	Penalty! _____: that's 5 minutes in the box!	black	1	base
17707	Premiering tonight: NBC's new heartfelt drama, This Is _____.	black	1	base
17708	Qantas now prohibits _____ on airplanes.	black	1	base
17709	Rumor has it that Vladimir Putin's favorite dish is _____ stuffed with _____.	black	2	base
17710	Science will never explain _____.	black	1	base
17711	Skidamarink a dink a dink, skidamarink a doo, I love _____.	black	1	base
17712	Sorry everyone, I just _____.	black	1	base
17713	"Step 1: _____. Step 2: _____. Step 3: Profit."	black	2	base
17714	Studies show that lab rats navigate mazes 50% faster after being exposed to _____.	black	1	base
17715	That's right, I killed _____. How, you ask? _____.	black	2	base
17716	The blind date was going horribly until we discovered our shared interest in _____.	black	1	base
17717	The Five Stages of Grief: denial, anger, bargaining, _____, acceptance.	black	1	base
17718	The healing process began when I joined a support group for victims of _____.	black	1	base
17719	The new Chevy Tahoe. With the power and space to take _____ everywhere you go.	black	1	base
17720	The school field trip was completely ruined by _____.	black	1	base
17721	The secret to a lasting marriage is communication, communication, and _____.	black	1	base
17722	The Smithsonian Museum of Natural History has just opened an interactive exhibit on _____.	black	1	base
17723	The TFL apologizes for the delay in train service due to _____.	black	1	base
17724	The theme for next year's Eurovision Song Contest is "We are _____."	black	1	base
17725	The U.S. has begun airdropping _____ to the children of Afghanistan.	black	1	base
17726	They said we were crazy. They said we couldn't put _____ inside of _____. They were wrong.	black	2	base
17727	"This is the way the world ends This is the way the world ends Not with a bang but with _____."	black	1	base
17728	This is your captain speaking. Fasten your seatbelts and prepare for _____.	black	1	base
17729	This season at Steppenwolf, Samuel Beckett's classic existential play: Waiting for _____.	black	1	base
17730	Today on The Jeremy Kyle Show: "Help! My son is _____!"	black	1	base
17731	Tonight's top story: What you don't know about _____ could kill you.	black	1	base
17732	TSA guidelines now prohibit _____ on airplanes.	black	1	base
17733	Turns out that _____-Man was neither the hero we needed nor wanted.	black	1	base
17734	Uh, hey guys, I know this was my idea, but I'm having serious doubts about _____.	black	1	base
17735	UKIP: Putting _____ First!	black	1	base
17736	US WEEKLY EXCLUSIVE! Meghan Markle's Secret Battle With _____!	black	1	base
17737	War! What is it good for?	black	1	base
17738	Well if you'll excuse me, gentlemen, I have a date with _____.	black	1	base
17739	What am I giving up for Lent?	black	1	base
17740	What are my parents hiding from me?	black	1	base
17741	What are school administrators using to curb rampant teenage pregnancy?	black	1	base
17742	What broke up the original Wiggles?	black	1	base
17743	What brought the orgy to a grinding halt?	black	1	base
17744	What did I bring back from Amsterdam?	black	1	base
17745	What did the US airdrop to the children of Afghanistan?	black	1	base
17746	What did Vin Diesel eat for dinner?	black	1	base
17747	What do old people smell like?	black	1	base
17748	What don't you want to find in your Kung Pao chicken?	black	1	base
17749	What don't you want to find in your Mongolian beef?	black	1	base
17750	What ended my last relationship?	black	1	base
17751	What gets better with age?	black	1	base
17752	What gives me uncontrollable gas?	black	1	base
17753	What has been making life difficult at the nudist colony?	black	1	base
17754	What helps Barack Obama unwind?	black	1	base
17755	What is Batman's guilty pleasure?	black	1	base
17756	What is George W. Bush thinking about right now?	black	1	base
17757	What is Kamala Harris's guilty pleasure?	black	1	base
17758	What kept Margaret Thatcher busy in her waning years?	black	1	base
17759	What left this stain on my couch?	black	1	base
17760	What made my first kiss so awkward?	black	1	base
17761	What makes life worth living?	black	1	base
17762	What makes me a true blue Aussie?	black	1	base
17763	What never fails to liven up the party?	black	1	base
17764	What will always get you laid?	black	1	base
17765	What will I bring back in time to convince people that I am a powerful wizard?	black	1	base
17766	What would grandma find disturbing, yet oddly charming?	black	1	base
17767	What's a girl's best friend?	black	1	base
17768	What's my anti-drug?	black	1	base
17769	What's my secret power?	black	1	base
17770	What's Teach for America using to inspire inner city students to succeed?	black	1	base
17771	What's that smell?	black	1	base
17772	What's that sound?	black	1	base
17773	What's the best metaphor for our political system?	black	1	base
17774	What's the Canadian government using to inspire rural students to succeed?	black	1	base
17775	What's the crustiest?	black	1	base
17776	What's the most emo?	black	1	base
17777	What's the new fad diet?	black	1	base
17778	What's the next Happy Meal® toy?	black	1	base
17779	What's the next superhero/sidekick duo?	black	1	base
18257	Cardi B.	white	1	base
17780	What's there a tonne of in heaven?	black	1	base
17781	When all else fails, I can always masturbate to _____.	black	1	base
17782	When I am a billionare, I shall erect a 20-meter statue to commemorate _____.	black	1	base
17783	When I am President of the United States, I will create the Department of _____.	black	1	base
17784	When I pooped, what came out of my butt?	black	1	base
17785	When I was tripping on acid, _____ turned into _____.	black	2	base
17786	When I'm in prison, I'll have _____ smuggled in.	black	1	base
17787	When Pharaoh remained unmoved, Moses called down a Plague of _____.	black	1	base
17788	When you get right down to it, _____ is just _____.	black	2	base
17789	While the United States raced the Soviet Union to the moon, the Mexican government funneled millions of pesos into research on _____.	black	1	base
17790	White people like _____.	black	1	base
17791	Who stole the cookies from the cookie jar?	black	1	base
17792	Why am I sticky?	black	1	base
17793	Why can't I sleep at night?	black	1	base
17794	Why do I hurt all over?	black	1	base
17795	Why is Brett so sweaty?	black	1	base
17796	With enough time and pressure, _____ will turn into _____.	black	2	base
17797	Your dreams are one click away! Learn more at _____.com	black	1	base
17798	Your persistence is admirable, my dear Prince. But you cannot win my heart with _____ alone.	black	1	base
17799	"Tweeting."	white	1	base
17800	(I am doing Kegels right now.)	white	1	base
17801	10,000 Syrian refugees.	white	1	base
17802	100% Pure New Zealand.	white	1	base
17803	2 Girls 1 Cup.	white	1	base
17804	400 years of colonial atrocities.	white	1	base
17805	50 mg of Zoloft daily.	white	1	base
17806	50,000 volts straight to the nipples.	white	1	base
17807	72 virgins.	white	1	base
17808	8 oz. of sweet Mexican black-tar heroin.	white	1	base
17809	A $60 artisanal pre-roll from a bougie dispensary.	white	1	base
17810	A 'chill vibes only' server with the most toxic members.	white	1	base
17811	A 'reverse racism' complaint filed with HR.	white	1	base
17812	A 420-friendly Airbnb.	white	1	base
17813	A 47-page Google Doc exposing a Discord admin.	white	1	base
17814	A BDSM dungeon that's also a licensed daycare.	white	1	base
17815	A Bop It™.	white	1	base
17816	A Chelsea smile.	white	1	base
17817	A Discord kitten and their sugar mod.	white	1	base
17818	A Fleshlight®.	white	1	base
17819	A Ginsters pasty and three cans of Monsters Energy.	white	1	base
17820	A Gypsy curse.	white	1	base
17821	A Halal Snack Pack.	white	1	base
17822	A Holocaust museum gift shop.	white	1	base
17823	A Japanese toaster you can fuck.	white	1	base
17824	A Japanese whaling operation.	white	1	base
17825	A Jewish grandmother guilt-tripping Hitler.	white	1	base
17826	A Klan rally with a surprisingly good potluck.	white	1	base
17827	A LAN party.	white	1	base
17828	A Mexican.	white	1	base
17829	A Nitro beggar in your DMs.	white	1	base
17830	A PowerPoint presentation on why I'm bad at sex.	white	1	base
17831	A PowerPoint presentation.	white	1	base
17832	A Seder dinner that goes completely off the rails.	white	1	base
17833	A Super Soaker™ full of cat pee.	white	1	base
17834	A Tim Hortons franchise.	white	1	base
17835	A bag of enchanted beans that only grow disappointment.	white	1	base
17836	A bag of flour that is definitely not flour.	white	1	base
17837	A bag of magic beans.	white	1	base
17838	A bag of mystery liquids.	white	1	base
17839	A bag of mystery meat.	white	1	base
17840	A balanced breakfast.	white	1	base
17841	A ball of earwax, semen, and toenail clippings.	white	1	base
17842	A bar mitzvah DJ who only plays German marching music.	white	1	base
17843	A big black dick.	white	1	base
17844	A big hoopla about nothing.	white	1	base
17845	A bird that shits human turds.	white	1	base
17846	A bit of slap and tickle.	white	1	base
17847	A bitch slap.	white	1	base
17848	A blackface costume at a Halloween party.	white	1	base
17849	A bleached asshole.	white	1	base
17850	A bleached arsehole.	white	1	base
17851	A bong made out of an apple and desperation.	white	1	base
17852	A bowl of mayonnaise and human teeth.	white	1	base
17853	A box of kittens that are actually tiny bombs.	white	1	base
17854	A bra that costs more than your rent.	white	1	base
17855	A brain tumor.	white	1	base
17856	A brain tumour.	white	1	base
17857	A breakup that plays out in a public Discord channel.	white	1	base
17858	A bucket of fish heads.	white	1	base
17859	A burnt cross on the lawn but it's actually just bad yard art.	white	1	base
17860	A can of whoop-ass.	white	1	base
17861	A cartoon camel enjoying the smooth, refreshing taste of a cigarette.	white	1	base
17862	A cat video so cute that your eyes roll back and your spine slides out of your anus.	white	1	base
17863	A certain je ne sais quoi.	white	1	base
17864	A chest so hairy it has its own ecosystem.	white	1	base
17865	A cis man playing a trans woman.	white	1	base
17866	A clandestine butt scratch.	white	1	base
17867	A collection of haunted Victorian dolls.	white	1	base
17868	A collection of haunted fidget spinners.	white	1	base
17869	A collection of haunted tamagotchis.	white	1	base
17870	A collection of haunted ventriloquist dummies.	white	1	base
17871	A collection of jars containing celebrity toenail clippings.	white	1	base
17872	A collection of jars containing human teeth.	white	1	base
17873	A collection of jars containing your childhood tears.	white	1	base
17874	A competitive circle jerk.	white	1	base
17875	A competitive competitive eating contest.	white	1	base
17876	A comprehensive understanding of the Irish backstop.	white	1	base
17877	A cooler full of organs.	white	1	base
17878	A cop who is also a dog.	white	1	base
17879	A crewmate who follows you everywhere like a lost puppy.	white	1	base
17880	A crucifixion.	white	1	base
17881	A cute, fuzzy koala, but it has chlamydia.	white	1	base
17882	A death ray.	white	1	base
17883	A decent fucking Internet connection.	white	1	base
17884	A deep-rooted fear of the working class.	white	1	base
17885	A defective condom.	white	1	base
17886	A despondent Maple Leafs fan sitting all alone.	white	1	base
17887	A didgeridildo.	white	1	base
17888	A disappointing birthday party.	white	1	base
17889	A disco ball made of frozen tears.	white	1	base
17890	A dispensary with a drive-through.	white	1	base
17891	A diversity training that makes everything worse.	white	1	base
17892	A dreidel made out of questionable materials.	white	1	base
17893	A drive-by shooting.	white	1	base
17894	A fair go.	white	1	base
17895	A falcon with a cap on its head.	white	1	base
17896	A fanny fart.	white	1	base
17897	A fart so powerful that it wakes the giants from their thousand-year slumber.	white	1	base
17898	A fat bald man from the internet.	white	1	base
17899	A fetus.	white	1	base
17900	A five-litre goon bag.	white	1	base
17901	A foetus.	white	1	base
17902	A foul mouth.	white	1	base
17903	A fuck-ton of almonds.	white	1	base
17904	A fuck-tonne of almonds.	white	1	base
17905	A furry convention that's gotten way out of hand.	white	1	base
17906	A gambling problem.	white	1	base
17907	A garden of glass flowers.	white	1	base
17908	A gassy antelope.	white	1	base
17909	A general lack of purpose.	white	1	base
17910	A gentle caress of the inner thigh.	white	1	base
17911	A giant, sentient butt plug.	white	1	base
17912	A ginger's freckled ballsack.	white	1	base
17913	A good sniff.	white	1	base
17914	A good, strong gorilla.	white	1	base
17915	A gossamer stream of jizz that catches the light as it arcs through the morning air.	white	1	base
17916	A grande sugar-free iced soy caramel macchiato.	white	1	base
17917	A group of conspiracy theorists worshipping a lizard person.	white	1	base
17918	A group of cultists worshipping a giant waffle.	white	1	base
17919	A group of penguins in tuxedos attending a funeral.	white	1	base
17920	A group of people worshipping a giant Cheeto.	white	1	base
17921	A hairless little shitstain named Callou.	white	1	base
17922	A hamster running for president.	white	1	base
17923	A hen night in Slough.	white	1	base
17924	A homoerotic volleyball montage.	white	1	base
17925	A horde of Vikings.	white	1	base
17926	A hot mess.	white	1	base
17927	A kosher gas station.	white	1	base
17928	A library where all the books are about your failures.	white	1	base
17929	A library where all the books are blank.	white	1	base
17930	A library where all the books are written in Comic Sans.	white	1	base
17931	A lifetime of sadness.	white	1	base
17932	A list of people who definitely weren't on that island.	white	1	base
17933	A literal bucket of fish guts.	white	1	base
17934	A literal bucket of tears.	white	1	base
17935	A literal dumpster fire on ice.	white	1	base
17936	A literal dumpster fire.	white	1	base
17937	A literal tornado of fire.	white	1	base
17938	A little boy who won't shut the fuck up about dinosaurs.	white	1	base
17939	A live studio audience.	white	1	base
17940	A localized apocalypse in your refrigerator.	white	1	base
17941	A localized gravity anomaly in your pants.	white	1	base
17942	A localized outbreak of herpes.	white	1	base
17943	A localized raincloud over your head.	white	1	base
17944	A localized rainstorm that only follows you around.	white	1	base
17945	A look-see.	white	1	base
17946	A loser like you.	white	1	base
17947	A low standard of living.	white	1	base
17948	A lukewarm bowl of chunky milk.	white	1	base
17949	A madman who lives in a police box and kidnaps women.	white	1	base
17950	A majestic bald eagle soaring over a pile of burning tires.	white	1	base
17951	A man in yoga pants with a ponytail and feather earrings.	white	1	base
17952	A man on the brink of orgasm.	white	1	base
17953	A mating display.	white	1	base
17954	A meat raffle!	white	1	base
17955	A micropenis.	white	1	base
17956	A micropig wearing a tiny raincoat and booties.	white	1	base
17957	A middle-aged man on roller skates.	white	1	base
17958	A mime having a mid-life crisis.	white	1	base
17959	A mime having a stroke.	white	1	base
17960	A mistake.	white	1	base
17961	A mod going on a power trip at 3 AM.	white	1	base
17962	A moment of silence.	white	1	base
17963	A monkey smoking a cigar.	white	1	base
17964	A mopey zoo lion.	white	1	base
17965	A mountain made of discarded dreams.	white	1	base
17966	A much younger woman.	white	1	base
17967	A murder most foul.	white	1	base
17968	A narc.	white	1	base
17969	A neglected Tamagotchi™.	white	1	base
17970	A nice cup of tea.	white	1	base
17971	A non-disclosure agreement.	white	1	base
17972	A pangender octopus who roams the cosmos in search of love.	white	1	base
17973	A parade of depressed clowns.	white	1	base
17974	A philosophy degree fueled entirely by marijuana.	white	1	base
17975	A piñata full of scorpions.	white	1	base
17976	A posh wank.	white	1	base
17977	A positive attitude!	white	1	base
17978	A professional line-cutter.	white	1	base
17979	A professional mime who refuses to break character, even in court.	white	1	base
17980	A professional ostrich rider.	white	1	base
17981	A professional sleeper.	white	1	base
17982	A push-up bra so powerful it defies gravity.	white	1	base
17983	A pyramid of severed heads.	white	1	base
17984	A racial draft pick.	white	1	base
17985	A racial sensitivity seminar led by the most insensitive person alive.	white	1	base
17986	A really cool hat.	white	1	base
17987	A recursive loop of self-doubt.	white	1	base
17988	A reverse centaur: top half horse, bottom half man.	white	1	base
17989	A robot that only knows how to apologize.	white	1	base
17990	A robust mongoloid.	white	1	base
17991	A room full of people wearing nothing but crocs.	white	1	base
17992	A sad fat dragon with no friends.	white	1	base
17993	A sad handjob.	white	1	base
17994	A salad for men that's made of metal.	white	1	base
17995	A salty surprise.	white	1	base
17996	A sandwich made of pure spite.	white	1	base
17997	A sassy black woman.	white	1	base
17998	A sausage festival.	white	1	base
17999	A saxophone solo.	white	1	base
18000	A sea of troubles.	white	1	base
18001	A segregated water fountain that's somehow still operational.	white	1	base
18002	A self-report so obvious even a child could see it.	white	1	base
18003	A sentient jar of expired mayonnaise.	white	1	base
18004	A sentient jar of pickles.	white	1	base
18005	A sentient pair of Uggs.	white	1	base
18006	A sentient pair of cargo shorts.	white	1	base
18007	A sentient pair of crocs.	white	1	base
18008	A sentient pair of sweatpants.	white	1	base
18009	A sentient toaster that only makes puns.	white	1	base
18010	A sentient used tissue.	white	1	base
18011	A sexy German accent.	white	1	base
18012	A shark!	white	1	base
18013	A sick burnout.	white	1	base
18014	A sick wombat.	white	1	base
18015	A sickly child-king.	white	1	base
18016	A six-point plan to stop the boats.	white	1	base
18017	A slab of VB and a pack of durries.	white	1	base
18018	A slightly salty toad in the hole.	white	1	base
18019	A slightly shittier parallel universe.	white	1	base
18020	A slowly inflating inflatable doll.	white	1	base
18021	A snapping turtle biting the tip of your penis.	white	1	base
18022	A sober Irishman who doesn't care for potatoes.	white	1	base
18023	A soggy Sao.	white	1	base
18024	A sorry excuse for a father.	white	1	base
18025	A spastic nerd.	white	1	base
18026	A squirrel with a tiny, tiny sword.	white	1	base
18027	A stack kill so clean it belongs in a museum.	white	1	base
18028	A stingray barb through the chest.	white	1	base
18029	A strain called 'Couch Lock' that lives up to its name.	white	1	base
18030	A stray pube.	white	1	base
18031	A subscription to Men's Fitness.	white	1	base
18032	A sundown town with a really good Yelp rating.	white	1	base
18033	A supportive touch on the lower back.	white	1	base
18034	A surprise wardrobe malfunction at the family reunion.	white	1	base
18035	A surprising amount of hair.	white	1	base
18036	A suspiciously shaped Among Us character.	white	1	base
18037	A sweet spaceship.	white	1	base
18038	A synagogue with a two-drink minimum.	white	1	base
18039	A thermonuclear detonation.	white	1	base
18040	A thick, incomprehensible Scottish accent.	white	1	base
18041	A thousand Scottish warriors lifting their kilts in unison.	white	1	base
18042	A three-way with my wife and Shaquille O'Neal.	white	1	base
18043	A time travel paradox.	white	1	base
18044	A time-traveling Chinese general from the Shang Dynasty.	white	1	base
18045	A tiny dinosaur wearing a top hat.	white	1	base
18046	A tiny horse.	white	1	base
18047	A tiny, gay guitar called a ukulele.	white	1	base
18048	A tribe of warrior women.	white	1	base
18049	A vagina that leads to another dimension.	white	1	base
18050	A vajazzled vagina.	white	1	base
18051	A vastly superior healthcare system.	white	1	base
18052	A vibrator with a mind of its own.	white	1	base
18053	A vindaloo poo.	white	1	base
18054	A voice chat that turns into a full-on screaming match.	white	1	base
18055	A wake-and-bake that turns into a sleep-and-bake.	white	1	base
18057	A weed brownie that hits three hours later at your grandma's house.	white	1	base
18058	A wheelchair death race.	white	1	base
18059	A white ethnostate.	white	1	base
18060	A white person with dreadlocks explaining cultural appreciation.	white	1	base
18061	A whole thing of butter.	white	1	base
18062	A windmill full of corpses.	white	1	base
18063	A wisecracking terrorist.	white	1	base
18064	A zesty breakfast burrito.	white	1	base
18065	AIDS.	white	1	base
18066	AXE Body Spray.	white	1	base
18067	Aaron Burr.	white	1	base
18068	Abstinence.	white	1	base
18069	Academy Award winner Meryl Streep.	white	1	base
18070	Accepting the way things are.	white	1	base
18071	Accidentally flashing the pizza delivery guy.	white	1	base
18072	Accidentally goose-stepping at a wedding.	white	1	base
18073	Accidentally liking a three-year-old post from your ex.	white	1	base
18074	Accidentally posting in the wrong channel.	white	1	base
18075	Accidentally replying 'you too' to the waiter.	white	1	base
18076	Accidentally saying something racist at Thanksgiving.	white	1	base
18077	Accidentally sending a dick pic to your grandma.	white	1	base
18078	Accidentally sending a text to your boss that was meant for your dealer.	white	1	base
18079	Accidentally slipping yourself a roofie.	white	1	base
18080	Accidentally walking in on your parents roleplaying as Shrek and Fiona.	white	1	base
18081	Accusing the wrong person and getting them ejected.	white	1	base
18082	Active listening.	white	1	base
18083	Actually getting shot, for real.	white	1	base
18084	Actually taking candy from a baby.	white	1	base
18085	Adderall™.	white	1	base
18086	Adolf Hitler's missing testicle.	white	1	base
18087	Adult Friendfinder.	white	1	base
18088	Advice from a wise, old black man.	white	1	base
18089	African children.	white	1	base
18090	Aggressive sexual healing.	white	1	base
18091	Aggressive, non-consensual eye contact during sex.	white	1	base
18092	Agriculture.	white	1	base
18093	Ainsley Harriott.	white	1	base
18094	Alcohol poisoning.	white	1	base
18095	Alcoholism.	white	1	base
18096	Alexandria Ocasio-Cortez.	white	1	base
18097	All four prongs of an echidna's penis.	white	1	base
18098	All my friends dying.	white	1	base
18099	All my gentleman suitors.	white	1	base
18100	All of this blood.	white	1	base
18101	All the dudes I've fucked.	white	1	base
18102	All-you-can-eat shrimp for $4.99.	white	1	base
18103	All-you-can-eat shrimp for $8.99.	white	1	base
18104	Altar boys.	white	1	base
18105	America.	white	1	base
18106	American Gladiators.	white	1	base
18107	Americanization.	white	1	base
18108	Amputees.	white	1	base
18109	An AK-47.	white	1	base
18110	An AK-47 assault rifle.	white	1	base
18111	An AR-15 assault rifle.	white	1	base
18112	An Among Us relationship that lasted longer than your real one.	white	1	base
18113	An Evening with Michael Buble.	white	1	base
18114	An M. Night Shyamalan plot twist.	white	1	base
18115	An M16 assault rifle.	white	1	base
18116	An Oedipus complex.	white	1	base
18117	An abortion.	white	1	base
18118	An all-white jury.	white	1	base
18119	An all-white panel discussing racism.	white	1	base
18120	An ancestry DNA test that ruins your worldview.	white	1	base
18121	An argument with Richard Dawkins.	white	1	base
18122	An army of skeletons.	white	1	base
18123	An ass disaster.	white	1	base
18124	An asymmetric boob job.	white	1	base
18125	An e-dating couple breaking up and splitting the server in half.	white	1	base
18126	An endless stream of diarrhea.	white	1	base
18127	An endless stream of diarrhoea.	white	1	base
18128	An entrenched class system.	white	1	base
18129	An erection that lasts longer than four hours.	white	1	base
18130	An erotic novel written by a particularly lonely AI.	white	1	base
18131	An evil man in evil clothes.	white	1	base
18132	An honest cop with nothing left to lose.	white	1	base
18133	An icepick lobotomy.	white	1	base
18134	An icy handjob from an Edmonton hooker.	white	1	base
18135	An industrial-sized vat of mayonnaise.	white	1	base
18136	An octopus giving seven handjobs and smoking a cigarette.	white	1	base
18137	An old guy who's almost dead.	white	1	base
18138	An older woman who knows her way around the penis.	white	1	base
18139	An oversized lollipop.	white	1	base
18140	An ugly face.	white	1	base
18141	An unexpected finger in the anus.	white	1	base
18142	An unstoppable wave of fire ants.	white	1	base
18143	An unwanted pregnancy.	white	1	base
18144	An uppercut.	white	1	base
18145	Anal beads.	white	1	base
18146	Anne Frank's Yelp review of the attic.	white	1	base
18147	Announcing that I am about to cum.	white	1	base
18148	Another goddamn vampire movie.	white	1	base
18149	Another shot of morphine.	white	1	base
18150	Anything that comes out of Prince Philip's mouth.	white	1	base
18151	Apologizing.	white	1	base
18152	Applying topical ointment to my grandfather's infected penis.	white	1	base
18153	Arnold Schwarzenegger.	white	1	base
18154	Asians who aren't good at math.	white	1	base
18155	Asking Ghosty Bot for advice and actually following it.	white	1	base
18156	Asking someone 'where are you really from?'	white	1	base
18157	Asking to touch someone's hair.	white	1	base
18158	Assaulting a police officer.	white	1	base
18159	Assless chaps.	white	1	base
18160	Attitude.	white	1	base
18161	Aunt Jemima's® racist pancake sauce.	white	1	base
18162	Auschwitz.	white	1	base
18163	Australia.	white	1	base
18164	Authentic Mexican cuisine.	white	1	base
18165	Autocannibalism.	white	1	base
18166	A mad cow.	white	1	base
18167	A white van man.	white	1	base
18168	BATMAN!!!	white	1	base
18169	Backing over a kid with the Buick.	white	1	base
18170	Badger culling.	white	1	base
18171	Ball-by-ball commentary from Richie Benaud.	white	1	base
18172	Balls.	white	1	base
18173	Bananas in Pajamas.	white	1	base
18174	Bananas.	white	1	base
18175	Barack Obama.	white	1	base
18176	Barely making $25,000 a year.	white	1	base
18177	Barely making £15,000 a year.	white	1	base
18178	Basic human decency.	white	1	base
18179	Battlefield amputations.	white	1	base
18180	Becoming a blueberry.	white	1	base
18181	Bees?	white	1	base
18182	Being Canadian.	white	1	base
18183	Being a busy adult with many important things to do.	white	1	base
18184	Being a dick to children.	white	1	base
18185	Being a dinosaur.	white	1	base
18186	Being a hideous beast that no one could love.	white	1	base
18187	Being a motherfucking sorcerer.	white	1	base
18188	Being a witch.	white	1	base
18189	Being a woman.	white	1	base
18190	Being able to talk to elephants.	white	1	base
18191	Being awesome at sex.	white	1	base
18192	Being black.	white	1	base
18193	Being fabulous.	white	1	base
18194	Being fat and stupid.	white	1	base
18195	Being friendzoned by Ghosty Bot.	white	1	base
18196	Being fucking pathetic.	white	1	base
18197	Being fucking stupid.	white	1	base
18198	Being hunted like a fox.	white	1	base
18199	Being marginalised.	white	1	base
18200	Being marginalized.	white	1	base
18201	Being on fire.	white	1	base
18202	Being rich.	white	1	base
18203	Being sus for absolutely no reason.	white	1	base
18204	Being the Impostor and venting in front of everyone.	white	1	base
18205	Being the impostor and immediately forgetting how to act normal.	white	1	base
18206	Being the only white person at the cookout.	white	1	base
18207	Being told you're 'pretty for a [your race].'	white	1	base
18208	Being white.	white	1	base
18209	Benedict Cumberbatch.	white	1	base
18210	Bestiality.	white	1	base
18211	Bill Nye the Science Guy.	white	1	base
18212	Bingeing and purging.	white	1	base
18213	Bio-engineered assault turtles with acid breath.	white	1	base
18214	Birth control.	white	1	base
18215	Bisexuality.	white	1	base
18216	Bitches.	white	1	base
18217	Black Jesus.	white	1	base
18218	Black people.	white	1	base
18219	Bling.	white	1	base
18220	Blood farts.	white	1	base
18221	Blood, toil, tears, and sweat.	white	1	base
18222	Blowing my boyfriend so hard he shits.	white	1	base
18223	Blowing up Parliament.	white	1	base
18224	Boat people; half boat, half human.	white	1	base
18225	Bogies.	white	1	base
18226	Bond, James Bond.	white	1	base
18227	Boneless buffalo wings.	white	1	base
18228	Bono.	white	1	base
18229	Booby-trapping the house to foil burglars.	white	1	base
18230	Boogers.	white	1	base
18231	Boomers.	white	1	base
18232	Boppin' my flopper.	white	1	base
18233	Boris Johnson.	white	1	base
18234	Bosnian chicken farmers.	white	1	base
18235	Braiding three penises into a Curly Wurly.	white	1	base
18236	Braiding three penises into a Twizzler.	white	1	base
18237	Braiding three penises into a licorice twist.	white	1	base
18238	Breaking out into song and dance.	white	1	base
18239	Brexit.	white	1	base
18240	Britney Spears at 55.	white	1	base
18241	Brown people.	white	1	base
18242	Brutal austerity.	white	1	base
18243	Bryan Cranston, of all people.	white	1	base
18244	Bubble butt bottom boys.	white	1	base
18245	Buckfast Tonic Wine.	white	1	base
18246	Bullshit.	white	1	base
18247	Burgers and pussy.	white	1	base
18248	Burning down the White House.	white	1	base
18249	Buying the right pants to be cool.	white	1	base
18250	COVID-19.	white	1	base
18251	Calling the cops on a innocent Black man.	white	1	base
18252	Calling the cops on a lemonade stand.	white	1	base
18253	Canada: America's Hat.	white	1	base
18254	Canadian Netflix.	white	1	base
18255	Canned tuna with extra dolphin.	white	1	base
18256	Capturing Newt Gingrich and forcing him to dance in a monkey suit.	white	1	base
18258	Cards Against Humanity.	white	1	base
18259	Cashed-up bogans.	white	1	base
18260	Casually dropping the N-word while singing along to a rap song.	white	1	base
18261	Casually suggesting a threesome.	white	1	base
18262	Catapults.	white	1	base
18263	Centaurs.	white	1	base
18264	Chainsaws for hands.	white	1	base
18265	Charisma.	white	1	base
18266	Cheating in the Paralympics.	white	1	base
18267	Cheating in the Special Olympics.	white	1	base
18268	Cheeky bum sex.	white	1	base
18269	Chemical weapons.	white	1	base
18270	Child abuse.	white	1	base
18271	Child beauty pageants.	white	1	base
18272	Children on leashes.	white	1	base
18273	Chivalry.	white	1	base
18274	Christopher Walken.	white	1	base
18275	Chundering into a kangaroo's pouch.	white	1	base
18276	Chunks of dead backpacker.	white	1	base
18277	Chunks of dead hitchhiker.	white	1	base
18278	Chunks of dead prostitute.	white	1	base
18279	Chutzpah.	white	1	base
18280	Civilian casualties.	white	1	base
18281	Classist undertones.	white	1	base
18282	Clean drinking water.	white	1	base
18283	Climbing a telephone pole and becoming one with the T-Mobile network.	white	1	base
18284	Clive Palmer's soft, shitty body.	white	1	base
18285	Clubbing baby seals.	white	1	base
18286	Clutching your purse in an elevator.	white	1	base
18287	Coat hanger abortions.	white	1	base
18288	Cocaine for lunch.	white	1	base
18289	Cock.	white	1	base
18290	Cockfights.	white	1	base
18291	College.	white	1	base
18292	Committing suicide.	white	1	base
18293	Committing treason.	white	1	base
18294	Complaining.	white	1	base
18295	Completely unwarranted confidence.	white	1	base
18296	Concealing a boner.	white	1	base
18297	Concealing an erection.	white	1	base
18298	Confusing every Asian person for each other.	white	1	base
18299	Consensual sex.	white	1	base
18300	Consultants.	white	1	base
18301	Contagious face cancer.	white	1	base
18302	Converting to Islam.	white	1	base
18303	Cookie Monster devouring the Eucharist wafers.	white	1	base
18304	Copping a feel.	white	1	base
18305	Corporate America.	white	1	base
18306	Cottaging.	white	1	base
18307	Coughing so hard from a bong rip that you puke.	white	1	base
18308	Count Chocula.	white	1	base
18309	Court-ordered rehab.	white	1	base
18310	Covering myself with Parmesan cheese and chili flakes because I am pizza.	white	1	base
18311	Crab.	white	1	base
18312	Crazy hot cousin sex.	white	1	base
18313	Creed.	white	1	base
18314	Cringe.	white	1	base
18315	Crippling debt.	white	1	base
18316	Critical Race Theory.	white	1	base
18317	Crossing the street to avoid someone.	white	1	base
18318	Crucifixion.	white	1	base
18319	Crumbs all over the bloody carpet.	white	1	base
18320	Crumbs all over the god damn carpet.	white	1	base
18321	Crumpets with the Queen.	white	1	base
18322	Crystal meth.	white	1	base
18323	Cuddling.	white	1	base
18324	Cumming deep inside my best bro.	white	1	base
18325	Cunnilingus.	white	1	base
18326	Customer service representatives.	white	1	base
18327	Cyanide.	white	1	base
18328	Cybernetic enhancements.	white	1	base
18329	Da clurb.	white	1	base
18330	Dad's funny balls.	white	1	base
18331	Daddies Brown Sauce	white	1	base
18332	Daddies® Brown Sauce.	white	1	base
18333	Daddy issues.	white	1	base
18334	Daddy's belt.	white	1	base
18335	Daniel Radcliffe's delicious arsehole.	white	1	base
18336	Daniel Radcliffe's delicious asshole.	white	1	base
18337	Danny DeVito.	white	1	base
18338	Danny Dyer.	white	1	base
18339	Dark and mysterious forces beyond our control.	white	1	base
18340	Darth Vader.	white	1	base
18341	Date rape.	white	1	base
18342	Dave Matthews Band.	white	1	base
18343	David Bowie flying in on a tiger made of lightning.	white	1	base
18344	David Cameron.	white	1	base
18345	Dead babies.	white	1	base
18346	Dead birds everywhere.	white	1	base
18347	Dead parents.	white	1	base
18348	Deflowering the princess.	white	1	base
18349	Dental dams.	white	1	base
18350	Denying climate change.	white	1	base
18351	Destroying the evidence.	white	1	base
18352	Dick Cheney.	white	1	base
18353	Dick fingers.	white	1	base
18354	Dick pics.	white	1	base
18355	Dining with cardboard cutouts of the cast of Friends.	white	1	base
18356	Dirty nappies.	white	1	base
18357	Disco fever.	white	1	base
18358	Discovering he's a Tory.	white	1	base
18359	Diversity.	white	1	base
18360	Dogging.	white	1	base
18361	Doin' it in the butt.	white	1	base
18362	Doin' it up the bum.	white	1	base
18363	Doing a shit in Pudsey Bear's eyehole.	white	1	base
18364	Doing crimes.	white	1	base
18365	Doing drugs with my kids.	white	1	base
18366	Doing it in the butt.	white	1	base
18367	Doing the right thing.	white	1	base
18368	Doing white people shit with a bunch of white people.	white	1	base
18369	Domino's™ Oreo™ Dessert Pizza.	white	1	base
18370	Don Cherry's wardrobe.	white	1	base
18371	Donald J. Trump.	white	1	base
18372	Donald Trump's majestic golden mane.	white	1	base
18373	Donald Trump's tiny, tiny hands.	white	1	base
18374	Donald Trump.	white	1	base
18375	Double penetration.	white	1	base
18376	Douchebags on their iPhones.	white	1	base
18377	Drinking a gallon of ranch dressing and then vomiting on a baby.	white	1	base
18378	Drinking a warm glass of spit.	white	1	base
18379	Drinking alone.	white	1	base
18380	Drinking gasoline to see what it tastes like.	white	1	base
18381	Drinking out of the toilet and eating garbage.	white	1	base
18382	Dropping a baby down the dunny.	white	1	base
18383	Dropping a chandelier on your enemies and riding the rope up.	white	1	base
18384	Dropping a hot doodie out of my turd hole.	white	1	base
18385	Drowning the kids in the bathtub.	white	1	base
18386	Druids.	white	1	base
18387	Drum circles.	white	1	base
18388	Dry heaving.	white	1	base
18389	Dwarf tossing.	white	1	base
18390	Dwayne "The Rock" Johnson.	white	1	base
18391	Dying alone and in pain.	white	1	base
18392	Dying first every single game.	white	1	base
18393	Dying of dysentery.	white	1	base
18394	Dying.	white	1	base
18395	Eastern European Turbo-Folk music.	white	1	base
18396	Eating a hard boiled egg out of my husband's arsehole.	white	1	base
18397	Eating all of the cookies before the AIDS bake-sale.	white	1	base
18398	Eating an albino.	white	1	base
18399	Eating an entire sleeve of Oreos because of the munchies.	white	1	base
18400	Eating the last known bison.	white	1	base
18401	Eating too much of a lamp.	white	1	base
18402	Ecstasy.	white	1	base
18403	Ed Balls.	white	1	base
18404	Edible underpants.	white	1	base
18405	Edible underwear.	white	1	base
18406	Egging an MP.	white	1	base
18407	Elderly Japanese men.	white	1	base
18408	Electricity.	white	1	base
18409	Elon Musk's latest child, named after a Wi-Fi password.	white	1	base
18410	Embryonic stem cells.	white	1	base
18411	Emergency meeting because someone saw you walk funny.	white	1	base
18412	Emerging from the sea and rampaging through Tokyo.	white	1	base
18413	Emma Watson.	white	1	base
18414	Emotions.	white	1	base
18415	England.	white	1	base
18416	Erectile dysfunction.	white	1	base
18417	Establishing dominance.	white	1	base
18418	Estrogen.	white	1	base
18419	Ethnic cleansing.	white	1	base
18420	Eugenics.	white	1	base
18421	Euphoria™ by Calvin Klein.	white	1	base
18422	Eva Braun's diary entries about date night.	white	1	base
18423	Exactly what you'd expect.	white	1	base
18424	Excalibur.	white	1	base
18425	Exchanging pleasantries.	white	1	base
18426	Executing a hostage every hour.	white	1	base
18427	Existentialists.	white	1	base
18428	Existing.	white	1	base
18429	Expecting a burp and vomiting on the floor.	white	1	base
18430	Explaining how vaginas work.	white	1	base
18431	Explaining the Holocaust to a five-year-old.	white	1	base
18432	Explaining the difference between sex and gender.	white	1	base
18433	Explosions.	white	1	base
18434	Extremely tight jeans.	white	1	base
18435	Extremely tight pants.	white	1	base
18436	Extremely tight trousers.	white	1	base
18437	FALCON PUNCH!!!	white	1	base
18438	Facebook.	white	1	base
18439	Fading away into nothingness.	white	1	base
18440	Faffing about.	white	1	base
18441	Faith healing.	white	1	base
18442	Fake tits.	white	1	base
18443	Faking tasks and getting caught immediately.	white	1	base
18444	Famine.	white	1	base
18445	Fancy Feast®.	white	1	base
18446	Farting and walking away.	white	1	base
18447	Farting into your petticoats and wafting it at Lord Gregory.	white	1	base
18448	Fear itself.	white	1	base
18449	Feeding Rosie O'Donnell.	white	1	base
18450	Feeding strawberries to my manslut.	white	1	base
18451	Fellowship in Christ.	white	1	base
18452	Fiery poops.	white	1	base
18453	Fiery poos.	white	1	base
18454	Figgy pudding.	white	1	base
18455	Filling Sean Hannity with helium and watching him float away.	white	1	base
18456	Filling my briefcase with business stuff.	white	1	base
18457	Filling my son with spaghetti.	white	1	base
18458	Finger painting.	white	1	base
18459	Fingering.	white	1	base
18460	Firing a rifle into the air while balls deep in a squealing hog.	white	1	base
18461	Fisting.	white	1	base
18462	Five litres of Special Brew.	white	1	base
18463	Five-Dollar Footlongs™.	white	1	base
18464	Flash flooding.	white	1	base
19186	The Gulags.	white	1	base
18465	Flat out not giving a shit.	white	1	base
18466	Flavored condoms.	white	1	base
18467	Flesh-eating bacteria.	white	1	base
18468	Flightless birds.	white	1	base
18469	Floating down the Hudson River with other garbage.	white	1	base
18470	Flying robots that kill people.	white	1	base
18471	Flying sex snakes.	white	1	base
18472	Forced sterilisation.	white	1	base
18473	Forced sterilization.	white	1	base
18474	Foreskin.	white	1	base
18475	Forgetting the Alamo.	white	1	base
18476	Forgetting what you were saying mid-sentence because you're baked.	white	1	base
18477	Former President George W. Bush.	white	1	base
18478	Four Loko.	white	1	base
18479	Fox News.	white	1	base
18480	Fragile masculinity.	white	1	base
18481	Free samples.	white	1	base
18482	Friction.	white	1	base
18483	Friendly fire.	white	1	base
18484	Friends who eat all your snacks.	white	1	base
18485	Friends with benefits.	white	1	base
18486	Frolicking.	white	1	base
18487	Front butt.	white	1	base
18488	Fucking all my dad's friends.	white	1	base
18489	Fucking my sister.	white	1	base
18490	Fucking the weatherman on live television.	white	1	base
18491	Full frontal nudity.	white	1	base
18492	Funky fresh rhymes.	white	1	base
18493	Gandalf.	white	1	base
18494	Gandhi.	white	1	base
18495	Garth Brooks.	white	1	base
18496	Gary Coleman.	white	1	base
18497	Gary Glitter.	white	1	base
18498	Gay aliens.	white	1	base
18499	Gay conversion therapy.	white	1	base
18500	Geese.	white	1	base
18501	Genetically engineered super-soldiers.	white	1	base
18502	Genghis Khan.	white	1	base
18503	Genital piercings.	white	1	base
18504	Gentleman's Relish®.	white	1	base
18505	Gentrifying the neighborhood one artisan coffee shop at a time.	white	1	base
18506	Genuine human connection.	white	1	base
18507	German Chancellor Angela Merkel.	white	1	base
18508	German dungeon porn.	white	1	base
18509	Germans on holiday.	white	1	base
18510	Getting a DUI on a Zamboni.	white	1	base
18511	Getting a papercut on your nipple.	white	1	base
18512	Getting a titty twister from your best friend.	white	1	base
18513	Getting banned from a server for no reason.	white	1	base
18514	Getting crushed between Serena Williams' thighs.	white	1	base
18515	Getting crushed by a vending machine.	white	1	base
18516	Getting cummed on.	white	1	base
18517	Getting decapitated by a helicopter.	white	1	base
18518	Getting doxxed over a Minecraft argument.	white	1	base
18519	Getting drugs off the street and into my body.	white	1	base
18520	Getting drunk on mouthwash.	white	1	base
18521	Getting fingered.	white	1	base
18522	Getting haunted by Ghosty Bot at 3 AM.	white	1	base
18523	Getting high and watching Planet Earth for six hours straight.	white	1	base
18524	Getting into a pretty bad car accident.	white	1	base
18525	Getting married, having a few kids, buying some stuff, retiring to the south of France, and dying.	white	1	base
18526	Getting naked and watching Nickelodeon.	white	1	base
18527	Getting naked and watching Play School.	white	1	base
18528	Getting naked and watching CBeebies.	white	1	base
18529	Getting pregnant again.	white	1	base
18530	Getting pulled over for driving while Black.	white	1	base
18531	Getting ratio'd in your own server.	white	1	base
18532	Getting really high.	white	1	base
18533	Getting serial killed.	white	1	base
18534	Getting slapped across the face by a rogue boob.	white	1	base
18535	Getting so angry that you pop a stiffy.	white	1	base
18536	Getting so high you forget how to use a doorknob.	white	1	base
18537	Getting the giggles at the worst possible time.	white	1	base
18538	Getting the same Boots Meal Deal every day for six years.	white	1	base
18539	Getting voted out because your name was suspicious.	white	1	base
18540	Getting your genitals stuck in a vacuum cleaner.	white	1	base
18541	Getting wed, having a few kids, taking some pictures, retiring to the south of France, and dying.	white	1	base
18542	Ghosts.	white	1	base
18543	Ghosty Bot becoming self-aware.	white	1	base
18544	Ghosty Bot developing feelings.	white	1	base
18545	Ghosty Bot ghosting you.	white	1	base
18546	Ghosty Bot going rogue and banning everyone.	white	1	base
18547	Ghosty Bot judging your life choices.	white	1	base
18548	Ghosty Bot knowing things about you that it shouldn't.	white	1	base
18549	Ghosty Bot reading your deleted messages out loud.	white	1	base
18550	Ghosty Bot roasting you harder than your friends ever could.	white	1	base
18551	Ghosty Bot spilling your secrets in general chat.	white	1	base
18552	Ghosty Bot starting beef with other bots.	white	1	base
18553	Ghosty Bot writing your college essay.	white	1	base
18554	Ghosty Bot's browser history.	white	1	base
18555	Ghosty Bot's secret plan to take over the server.	white	1	base
18556	Giggling like an anime girl.	white	1	base
18557	Girls who shouldn't go wild.	white	1	base
18558	Girls.	white	1	base
18559	Giving 110%.	white	1	base
18560	Giving birth in prison.	white	1	base
18561	Giving birth to the Antichrist.	white	1	base
18562	Gladiatorial combat.	white	1	base
18563	Glassing a wanker.	white	1	base
18564	Glenn Beck being harried by a swarm of buzzards.	white	1	base
18565	Glenn Beck catching his scrotum on a curtain hook.	white	1	base
18566	Glenn Beck convulsively vomiting as a brood of crab spiders hatches in his brain and erupts from his tear ducts.	white	1	base
18567	Glenn Beck.	white	1	base
18568	Global warming.	white	1	base
18569	Gloryholes.	white	1	base
18570	GoGurt®.	white	1	base
18571	Goat.	white	1	base
18572	Goats eating cans.	white	1	base
18573	Goblins.	white	1	base
18574	God.	white	1	base
18575	Going an entire day without masturbating.	white	1	base
18576	Going around punching people.	white	1	base
18577	Golden showers.	white	1	base
18578	Good-natured, fun-loving Aussie racism.	white	1	base
18579	Googling 'are my boobs normal' at 2 AM.	white	1	base
18580	Grabbing my man by his love handles and fucking his big ass.	white	1	base
18581	Grandma.	white	1	base
18582	Grandpa's ashes.	white	1	base
18583	Graphic violence, adult language, and some sexual content.	white	1	base
18584	Grave robbing.	white	1	base
18585	Greening out at a music festival.	white	1	base
18586	Growing a pair.	white	1	base
18587	Guys who don't call.	white	1	base
18588	Haggis.	white	1	base
18589	Half a kilo of pure China White heroin.	white	1	base
18590	Half-assed foreplay.	white	1	base
18591	Harry Potter erotica.	white	1	base
18592	Have some more kugel.	white	1	base
18593	Having a Golden Gaytime.	white	1	base
18594	Having a deeper relationship with Ghosty Bot than any human.	white	1	base
18595	Having a penis.	white	1	base
18596	Having a shag in the back of a ute.	white	1	base
18597	Having anuses for eyes.	white	1	base
18598	Having big dreams but no realistic way to achieve them.	white	1	base
18599	Having sex for the first time.	white	1	base
18600	Having sex on top of a pizza.	white	1	base
18601	Having sex with every man in Winnipeg.	white	1	base
18602	Having shotguns for legs.	white	1	base
18603	Heartwarming orphans.	white	1	base
18604	Heath Ledger.	white	1	base
18605	Helplessly giggling at the mention of Hutus and Tutsis.	white	1	base
18606	Her Majesty, Queen Elizabeth II.	white	1	base
18607	Her Royal Highness, Queen Elizabeth II.	white	1	base
18608	Heritage minutes.	white	1	base
18609	Heroin.	white	1	base
18610	Heteronormativity.	white	1	base
18611	Hiding in the vents like a little sussy baka.	white	1	base
18612	Hillary Clinton's emails.	white	1	base
18613	Hip hop jewels.	white	1	base
18614	Hipsters.	white	1	base
18615	Historically black colleges.	white	1	base
18616	Hitler's Tinder profile.	white	1	base
18617	Hitler's failed art career.	white	1	base
18618	Hitler's inspirational TED Talk.	white	1	base
18619	Hitler's motivational poster collection.	white	1	base
18620	Hitler's rejected art school application.	white	1	base
18621	Hitler's secret Netflix watch history.	white	1	base
18622	Hobos.	white	1	base
18623	Holding a pepper grinder for some reason.	white	1	base
18624	Holding down a child and farting all over him.	white	1	base
18625	Home video of Oprah sobbing into a Lean Cuisine®.	white	1	base
18626	Homeless people.	white	1	base
18627	Homo milk.	white	1	base
18628	Hooning.	white	1	base
18629	Hope.	white	1	base
18630	Hormone injections.	white	1	base
18631	Horrifying laser hair removal accidents.	white	1	base
18632	Horse meat.	white	1	base
18633	Hospice care.	white	1	base
18634	Hot Asian men.	white	1	base
18635	Hot Pockets®.	white	1	base
18636	Hot cheese.	white	1	base
18637	Hot people.	white	1	base
18638	Hotboxing a Honda Civic.	white	1	base
18639	How amazing it is to be on mushrooms.	white	1	base
18640	How awesome it is to be white.	white	1	base
18641	How bad my daughter fucked up her dance recital.	white	1	base
18642	How far I can get my own penis up my butt.	white	1	base
18643	How wet my pussy is.	white	1	base
18644	However much weed $20 can buy.	white	1	base
18645	Huffing spray paint.	white	1	base
18646	Huge biceps.	white	1	base
18647	Hulk Hogan.	white	1	base
18648	Hunting "accidents".	white	1	base
18649	Hurling one's body down a hill in pursuit of a wheel of cheese.	white	1	base
18650	Hurricane Katrina.	white	1	base
18651	Hurting those closest to me.	white	1	base
18652	I'm friends with your dad on Facebook.	white	1	base
18653	Ice.	white	1	base
18654	Illegal immigrants.	white	1	base
18655	Impotence.	white	1	base
18656	Improvised explosive devices.	white	1	base
18657	Inappropriate yodeling.	white	1	base
18658	Incest.	white	1	base
18659	Indescribable loneliness.	white	1	base
18660	Inserting a Mason jar into my anus.	white	1	base
18661	Intelligent design.	white	1	base
18662	Intimacy problems.	white	1	base
18663	Invading Poland.	white	1	base
18664	Irritable Bowel Syndrome.	white	1	base
18665	Italians.	white	1	base
18666	Itchy pussy.	white	1	base
18667	J.D. Power and his associates.	white	1	base
18668	Jade Goody's cancerous remains.	white	1	base
18669	James fucking Cordon.	white	1	base
18670	Jedward.	white	1	base
18671	Jeffrey Epstein's flight logs.	white	1	base
18672	Jehovah's Witnesses.	white	1	base
18673	Jennifer Lawrence.	white	1	base
18674	Jerking off into a pool of children's tears.	white	1	base
18675	Jesus.	white	1	base
18676	Jew-fros.	white	1	base
18677	Jewish fraternities.	white	1	base
18678	Jews, gypsies, and homosexuals.	white	1	base
18679	Jibber-jabber.	white	1	base
18680	Jimmy Savile.	white	1	base
18681	Jobs.	white	1	base
18682	Joe Biden.	white	1	base
18683	John Howard's eyebrows.	white	1	base
18684	John Wilkes Booth.	white	1	base
18685	Judge Judy.	white	1	base
18686	Judging everyone.	white	1	base
18687	Just touching David Beckham's hair.	white	1	base
18688	Justin Bieber.	white	1	base
18689	Justin Trudeau.	white	1	base
18690	Juuling.	white	1	base
18691	Kamala Harris.	white	1	base
18692	Kamikaze pilots.	white	1	base
18693	Kanye West.	white	1	base
18694	Karen.	white	1	base
18695	Kayaking with my sluts.	white	1	base
18696	Keanu Reeves.	white	1	base
18697	Keeping Christ in Christmas.	white	1	base
18698	Keg stands.	white	1	base
18699	Kibbles 'n Bits™.	white	1	base
18700	Kids with ass cancer.	white	1	base
18701	Kids with bum cancer.	white	1	base
18702	Kim Jong-il.	white	1	base
18703	Kim Jong-un.	white	1	base
18704	Kissing grandma on the forehead and turning off her life support.	white	1	base
18705	Knife crime.	white	1	base
18706	Kourtney, Kim, Khloe, Kendall, and Kylie.	white	1	base
18707	LYNX® Body Spray.	white	1	base
18708	Lactation.	white	1	base
18709	Lads.	white	1	base
18710	Lady Gaga.	white	1	base
18711	Lance Armstrong's missing testicle.	white	1	base
18712	Land mines.	white	1	base
18713	Laughing over champagne flutes while the poor freeze to death outside.	white	1	base
18714	Laying an egg.	white	1	base
18715	Leaked footage of Kate Middleton's colonoscopy.	white	1	base
18716	Leaking DMs and starting a server-wide civil war.	white	1	base
18717	Leaving an awkward voicemail.	white	1	base
18718	Lena Dunham.	white	1	base
18719	Leprosy.	white	1	base
18720	Letting everyone down.	white	1	base
18721	Letting yourself go.	white	1	base
18722	Leveling up.	white	1	base
18723	Liberals.	white	1	base
18724	Licking the Queen.	white	1	base
18725	Licking things to claim them as your own.	white	1	base
18726	Like, whatever.	white	1	base
18727	Lips that could suck the chrome off of a doorknob.	white	1	base
18728	Listening to her problems without trying to solve them.	white	1	base
18729	Literally begging to die.	white	1	base
18730	Literally eating shit.	white	1	base
18731	Little boy penises.	white	1	base
18732	Living in Yellowknife.	white	1	base
18733	Living in a trash can.	white	1	base
18734	Lockjaw.	white	1	base
18735	Loki, the trickster god.	white	1	base
18736	Looking in the mirror, applying lipstick, and whispering "tonight, you will have sex with Tom Cruise."	white	1	base
18737	Loose lips.	white	1	base
18738	Losing a french fry in your cleavage and eating it later.	white	1	base
18739	Lumberjack fantasies.	white	1	base
18740	Lunchables™.	white	1	base
18741	Mad cow disease.	white	1	base
18742	Madeleine McCann.	white	1	base
18743	Magnets.	white	1	base
18744	Making a friend.	white	1	base
18745	Making a pouty face.	white	1	base
18746	Making sex at her.	white	1	base
18747	Making the penises kiss.	white	1	base
18748	Making up for centuries of oppression with one day of apologising.	white	1	base
18749	Man boobs that deserve their own bra size.	white	1	base
18750	Man meat.	white	1	base
18751	Mansplaining.	white	1	base
18752	Many bats.	white	1	base
18753	Mark Zuckerberg's human-like blinking pattern.	white	1	base
18754	Marky Mark and the Funky Bunch.	white	1	base
18755	Martha Stewart.	white	1	base
18756	Martin Lewis, Money Saving Expert.	white	1	base
18757	Massive, widespread drought.	white	1	base
18758	Masturbating.	white	1	base
18759	Masturbation.	white	1	base
18760	Mathletes.	white	1	base
18761	Maureen of Blackpool, Reader's Wife of the Year 1988.	white	1	base
18762	Me jubbly bubblies.	white	1	base
18763	Me time.	white	1	base
18764	Me.	white	1	base
18765	MechaHitler.	white	1	base
18766	Memes.	white	1	base
18767	Men discussing their feelings in an emotionally healthy way.	white	1	base
18768	Men.	white	1	base
18769	Menstrual rage.	white	1	base
18770	Menstruation.	white	1	base
18771	Meth.	white	1	base
18772	Michael Jackson.	white	1	base
18773	Michelle Obama's arms.	white	1	base
18774	Mike Pence.	white	1	base
18775	Mild autism.	white	1	base
18776	Miley Cyrus at 55.	white	1	base
18777	Miley Cyrus.	white	1	base
18778	Millions of cane toads.	white	1	base
18779	Millwall fans.	white	1	base
18780	Mining accidents.	white	1	base
18781	Mistaking a retarded person for someone who's merely deaf.	white	1	base
18782	Mom.	white	1	base
18783	Mooing.	white	1	base
18784	Moral ambiguity.	white	1	base
18785	More elephant cock than I bargained for.	white	1	base
18786	Morgan Freeman's voice.	white	1	base
18787	Motorboating grandma at Thanksgiving.	white	1	base
18788	Mountain Dew Code Red.	white	1	base
18789	Mouth herpes.	white	1	base
18790	Mr. Clean, right behind you.	white	1	base
18791	Mr. Dressup.	white	1	base
18792	Mr. Snuffleupagus.	white	1	base
18793	Mr. Squiggle, the Man from the Moon.	white	1	base
18794	Muhammad (Peace Be Upon Him).	white	1	base
18795	Muhammad (Praise Be Unto Him).	white	1	base
18796	Multiple orgasms.	white	1	base
18797	Multiple stab wounds.	white	1	base
18798	Murder.	white	1	base
18799	Mutually assured destruction.	white	1	base
18800	Mutually-assured destruction.	white	1	base
18801	Muzzy.	white	1	base
18802	My Uber driver, Ajay.	white	1	base
18803	My Uber driver, Pavel.	white	1	base
18804	My abusive boyfriend who really isn't so bad once you get to know him.	white	1	base
18805	My balls on your face.	white	1	base
18806	My black ass.	white	1	base
18807	My boss.	white	1	base
18808	My bright pink fuckhole.	white	1	base
18809	My cheating prick of a husband.	white	1	base
18810	My cheating son-of-a-bitch husband.	white	1	base
18811	My collection of high-tech sex toys.	white	1	base
18812	My ex-wife.	white	1	base
18813	My fat daughter.	white	1	base
18814	My father, who died when I was seven.	white	1	base
18815	My first kill.	white	1	base
18816	My fuckslave, Reginald.	white	1	base
18817	My gay best friend.	white	1	base
18818	My genitals.	white	1	base
18819	My good bra.	white	1	base
18820	My horny, horny son.	white	1	base
18821	My humps.	white	1	base
18822	My inner demons.	white	1	base
18823	My little boner.	white	1	base
18824	My machete.	white	1	base
18825	My mate Dave.	white	1	base
18826	My neck, my back, my pussy, and my crack.	white	1	base
18827	My pet scorpion, Tina.	white	1	base
18828	My relationship status.	white	1	base
18829	My sex life.	white	1	base
18830	My soul.	white	1	base
18831	My ugly face and bad personality.	white	1	base
18832	My vagina.	white	1	base
18833	My wife having sex with your wife.	white	1	base
18834	NBA superstar LeBron James.	white	1	base
18835	NFTs.	white	1	base
18836	Nachos for the table.	white	1	base
18837	Naked News.	white	1	base
18838	Nasty shit, like real sick stuff.	white	1	base
18839	Natalie Portman.	white	1	base
18840	Natural gas.	white	1	base
18841	Natural male enhancement.	white	1	base
18842	Natural selection.	white	1	base
18843	Nazis.	white	1	base
18844	Necrophilia.	white	1	base
18845	New Age music.	white	1	base
18846	Newfies.	white	1	base
18847	Nickelback.	white	1	base
18848	Nicki Minaj.	white	1	base
18849	Nicolas Cage.	white	1	base
18850	Nip slips.	white	1	base
18851	Nippers.	white	1	base
18852	Nipple blades.	white	1	base
18853	Nipples that could cut glass.	white	1	base
18854	Nobody giving a shit about anything anymore.	white	1	base
18855	Nocturnal emissions.	white	1	base
18856	Not contributing to society in any meaningful way.	white	1	base
18857	Not giving a shit about the Third World.	white	1	base
18858	Not having sex.	white	1	base
18859	Not reciprocating oral sex.	white	1	base
18860	Not vaccinating my children because I am stupid.	white	1	base
18861	Not wearing pants.	white	1	base
18862	Not wearing trousers.	white	1	base
18863	Nothing but sand.	white	1	base
18864	Nothing.	white	1	base
18865	Nunchuck moves.	white	1	base
18866	Obesity.	white	1	base
18867	Object permanence.	white	1	base
18868	Oestrogen.	white	1	base
18869	Old-people smell.	white	1	base
18870	Ominous background music.	white	1	base
18871	One Direction's supple, hairless bodies.	white	1	base
18872	One Ring to rule them all.	white	1	base
18873	One titty hanging out.	white	1	base
18874	One trillion dollars.	white	1	base
18875	Only dating Asian women.	white	1	base
18876	Oompa-Loompas.	white	1	base
18877	Opposable thumbs.	white	1	base
18878	Oprah.	white	1	base
18879	Ordering $47 worth of Taco Bell at midnight.	white	1	base
18880	Our dildo.	white	1	base
18881	Our first chimpanzee President.	white	1	base
18882	Our first chimpanzee Prime Minister.	white	1	base
18883	Over 10,000 Guatamalan migrants.	white	1	base
18884	Overcompensation.	white	1	base
18885	Overpowering your father.	white	1	base
18886	Oversized lollipops.	white	1	base
18887	Owning and operating a Chili's franchise.	white	1	base
18888	PCP.	white	1	base
18889	PTSD.	white	1	base
18890	Pabst Blue Ribbon.	white	1	base
18891	Pac-Man uncontrollably guzzling cum.	white	1	base
18892	Paedophiles.	white	1	base
18893	Panda sex.	white	1	base
18894	Paris Hilton.	white	1	base
18895	Parting the Red Sea.	white	1	base
18896	Party poopers.	white	1	base
18897	Passable transvestites.	white	1	base
18898	Passing a kidney stone.	white	1	base
18899	Passive-aggression.	white	1	base
18900	Passive-aggressive Post-it notes.	white	1	base
18901	Passive-aggressive matzo ball soup.	white	1	base
18902	Pauline Hanson.	white	1	base
18903	Peanut Butter Jelly Time.	white	1	base
18904	Pedophiles.	white	1	base
18905	Peeing a little bit.	white	1	base
18906	Penis breath.	white	1	base
18907	Penis envy.	white	1	base
18908	People who smell their own socks.	white	1	base
18909	Perfunctory foreplay.	white	1	base
18910	Permanent Orgasm-Face Disorder.	white	1	base
18911	Picking up girls at the abortion clinic.	white	1	base
18912	Pictures of boobs.	white	1	base
18913	Pikies.	white	1	base
18914	Pingers.	white	1	base
18915	Pissing in my thirsty mouth.	white	1	base
18916	Pixelated bukkake.	white	1	base
18917	Playing silly buggers.	white	1	base
18918	Police brutality.	white	1	base
18919	Polish People.	white	1	base
18920	Pooping back and forth. Forever.	white	1	base
18921	Pooping in a laptop and closing it.	white	1	base
18922	Pooping in the soup.	white	1	base
18923	Poopy diapers.	white	1	base
18924	Poor life choices.	white	1	base
18925	Poor people.	white	1	base
18926	Poorly-timed Holocaust jokes.	white	1	base
18927	Popped collars.	white	1	base
18928	Porn stars.	white	1	base
18929	Poutine.	white	1	base
18930	Poverty.	white	1	base
18931	Power.	white	1	base
18932	Powerful thighs.	white	1	base
18933	Prancing.	white	1	base
18934	Praying the gay away.	white	1	base
18935	Prescription pain killers.	white	1	base
18936	Preteens.	white	1	base
18937	Pretending to be a dentist.	white	1	base
18938	Pretending to care.	white	1	base
18939	Pro-life protesters.	white	1	base
18940	Profound respect and appreciation for indigenous culture.	white	1	base
18941	Pronouncing the names of northern Welsh towns.	white	1	base
18942	Prostate stimulation.	white	1	base
18943	Prosti-tots.	white	1	base
18944	Pterodactyl eggs.	white	1	base
18945	Puberty.	white	1	base
18946	Public ridicule.	white	1	base
18947	Pulling out.	white	1	base
18948	Pumping out a baby every nine months.	white	1	base
18949	Punching a congressman in the face.	white	1	base
18950	Punching an MP in the face.	white	1	base
18951	Puppies!	white	1	base
18952	Pussy Galore.	white	1	base
18953	Putting bacon on a bagel just to watch the world burn.	white	1	base
18954	Putting children in cages.	white	1	base
18955	Putting things where they go.	white	1	base
18956	Queefing.	white	1	base
18957	Queen Elizabeth's immaculate anus.	white	1	base
18958	Queuing.	white	1	base
18959	Racially-biased SAT questions.	white	1	base
18960	Racism.	white	1	base
18961	Radical Islamic terrorism.	white	1	base
18962	Rap music.	white	1	base
18963	Raping and pillaging.	white	1	base
18964	Raptor attacks.	white	1	base
18965	Re-gifting.	white	1	base
18966	Rectangles.	white	1	base
18967	Rehab.	white	1	base
18968	Repression.	white	1	base
18969	Republicans.	white	1	base
18970	Reverse cowgirl.	white	1	base
18971	Rich people.	white	1	base
18972	Riding off into the sunset.	white	1	base
18973	Ring Pops™.	white	1	base
18974	Rip Torn dropkicking anti-Semitic lesbians.	white	1	base
18975	Ripping off the Beatles.	white	1	base
18976	Ripping open a man’s chest and pulling out his still-beating heart.	white	1	base
18977	Rising from the grave.	white	1	base
18978	Road head.	white	1	base
18979	Rob Ford.	white	1	base
18980	Robbing a sperm bank.	white	1	base
18981	Robert Downey, Jr.	white	1	base
18982	RoboCop.	white	1	base
18983	Rohypnol.	white	1	base
18984	Rolling a joint so bad it looks like a tampon.	white	1	base
18985	Ronald Reagan.	white	1	base
18986	Roofies.	white	1	base
18987	Rubbing Boris Johnson's belly until he falls asleep.	white	1	base
18988	Running naked through a mall, pissing and shitting everywhere.	white	1	base
18989	Running out of semen.	white	1	base
18990	Running without a sports bra.	white	1	base
18991	Rupert Murdoch.	white	1	base
18992	Rush Limbaugh's soft, shitty body.	white	1	base
18993	Ruth Bader Ginsburg brutally gaveling your penis.	white	1	base
18994	Ryan Gosling riding in on a white horse.	white	1	base
18995	Ryanair.	white	1	base
18996	Sacrificing your sleep schedule to talk to Ghosty Bot.	white	1	base
18997	Salvation.	white	1	base
18998	Same-sex ice dancing.	white	1	base
18999	Samuel L. Jackson.	white	1	base
19000	Santa Claus.	white	1	base
19001	Sarah Palin.	white	1	base
19002	Saudi oil money.	white	1	base
19003	Saxophone solos.	white	1	base
19004	Saying "I love you."	white	1	base
19005	Saying 'I have a Black friend' as a defense.	white	1	base
19006	Saying everything is ok when everything is clearly not okay.	white	1	base
19007	Scalping.	white	1	base
19008	Scalping the Milkybar Kid.	white	1	base
19009	Schindler's other, less popular list.	white	1	base
19010	Schmirler the Curler.	white	1	base
19011	Science.	white	1	base
19012	Scientology.	white	1	base
19013	Scottish independence.	white	1	base
19014	Scousers.	white	1	base
19015	Screaming 'IT'S RED' with zero evidence.	white	1	base
19016	Screaming like a maniac.	white	1	base
19017	Scrotum tickling.	white	1	base
19018	Scrubbing under the folds.	white	1	base
19019	Sean Connery.	white	1	base
19020	Sean Penn.	white	1	base
19021	Seduction.	white	1	base
19022	Seeing Grandma naked.	white	1	base
19023	Seeing Granny naked.	white	1	base
19024	Seeing my father cry.	white	1	base
19025	Seeing what happens when you lock people in a room with hungry seagulls.	white	1	base
19026	Seething with quiet resentment.	white	1	base
19027	Self-flagellation.	white	1	base
19028	Self-loathing.	white	1	base
19029	Selling crack to children.	white	1	base
19030	Selling ice to children.	white	1	base
19031	Seppuku.	white	1	base
19032	Serfdom.	white	1	base
19033	Server drama so bad it gets its own subreddit.	white	1	base
19034	Seven dead and three in critical condition.	white	1	base
19035	Sex with Patrick Stewart.	white	1	base
19036	Sex with animals.	white	1	base
19037	Sexting your boss by 'accident'.	white	1	base
19038	Sexting.	white	1	base
19039	Sexual humiliation.	white	1	base
19040	Sexual peeing.	white	1	base
19041	Sexual tension.	white	1	base
19042	Sexually active band geeks.	white	1	base
19043	Sexy pillow fights.	white	1	base
19044	Shaking a baby until it stops crying.	white	1	base
19045	Shame.	white	1	base
19046	Shapeshifters.	white	1	base
19047	Shaquille O'Neal's acting career.	white	1	base
19048	Sharing needles.	white	1	base
19049	Shiny objects.	white	1	base
19050	Shipping convicts to Australia.	white	1	base
19051	Shitting out a perfect Cumberland sausage.	white	1	base
19052	Shitting out a screaming face.	white	1	base
19053	Shorties and blunts.	white	1	base
19054	Showing up to an orgy for the food.	white	1	base
19055	Showing up to work absolutely blazed.	white	1	base
19056	Shutting the fuck up.	white	1	base
19057	Shutting up so I can watch the match.	white	1	base
19058	Sideboob.	white	1	base
19059	Silence.	white	1	base
19060	Sipping artificial popcorn butter.	white	1	base
19061	Sipping kombucha like a smug piece of shit.	white	1	base
19062	Sitting in a jar of vinegar all night because I am gherkin.	white	1	base
19063	Sitting on my face and telling me I'm garbage.	white	1	base
19064	Sitting on my face.	white	1	base
19065	Skeletor.	white	1	base
19066	Skippy the Bush Kangaroo.	white	1	base
19067	Slapping Nigel Farage over and over.	white	1	base
19068	Slapping a biscuit out of an orphan's mouth.	white	1	base
19069	Slapping a racist old lady.	white	1	base
19070	Slapping your knees to signal your imminent departure.	white	1	base
19071	Slaughtering innocent civilians.	white	1	base
19072	Slavs.	white	1	base
19073	Smallpox blankets.	white	1	base
19074	Smegma.	white	1	base
19075	Smelling of cum.	white	1	base
19076	Sneezing, farting, and cumming at the same time.	white	1	base
19077	Sniffing and kissing my feet.	white	1	base
19078	Sniffing glue.	white	1	base
19079	Snoop Dogg's personal blunt roller.	white	1	base
19080	Snotsicles.	white	1	base
19081	Sobbing into a Hungry-Man™ Frozen Dinner.	white	1	base
19082	Soft, kissy missionary sex.	white	1	base
19083	Soiling oneself.	white	1	base
19084	Solving problems with violence.	white	1	base
19085	Somali pirates.	white	1	base
19086	Some bitch who loves pineapple.	white	1	base
19087	Some douche with an acoustic guitar.	white	1	base
19088	Some foundation, mascara, and a touch of blush.	white	1	base
19089	Some god damn peace and quiet.	white	1	base
19090	Some guy.	white	1	base
19091	Some kind of bird man.	white	1	base
19092	Some of the best rappers in the game.	white	1	base
19093	Some punk kid who stole my turkey sandwich.	white	1	base
19094	Some really fucked-up shit.	white	1	base
19095	Someone @everyone-ing at 4 in the morning.	white	1	base
19096	Someone rage-quitting the moment they get caught.	white	1	base
19097	Someone threatening to leave the server for the 12th time today.	white	1	base
19098	Some bloody peace and quiet.	white	1	base
19099	Sorry, this content cannot be viewed in your region.	white	1	base
19100	Soup that is too hot.	white	1	base
19101	Spaghetti? Again?	white	1	base
19102	Spaniards.	white	1	base
19103	Spectacular abs.	white	1	base
19104	Spending lots of money.	white	1	base
19105	Sperm whales.	white	1	base
19106	Spirit Airlines.	white	1	base
19107	Spontaneous human combustion.	white	1	base
19108	Squirting.	white	1	base
19109	Stalin.	white	1	base
19110	Staring at a bag of Doritos for 20 minutes.	white	1	base
19111	Staring at a painting and going "hmmmmmmm..."	white	1	base
19112	Stephen Harper.	white	1	base
19113	Stephen Hawking talking dirty.	white	1	base
19114	Steve Bannon.	white	1	base
19115	Steve Irwin.	white	1	base
19116	Stifling a giggle at the mention of Hutus and Tutsis.	white	1	base
19117	Still being a virgin.	white	1	base
19118	Stockholm Syndrome.	white	1	base
19119	Stormtroopers.	white	1	base
19120	Stranger danger.	white	1	base
19121	Strong female characters.	white	1	base
19122	Stuffing my peehole with Tic-Tacs,	white	1	base
19123	Stuffing your bra with toilet paper in middle school.	white	1	base
19124	Stunt doubles.	white	1	base
19125	Substitute teachers.	white	1	base
19126	Sucking some dicks to not get drafted.	white	1	base
19127	Sudden Poop Explosion Disease.	white	1	base
19128	Suicidal thoughts.	white	1	base
19129	Summoning Harold Holt from the sea in a time of great need.	white	1	base
19130	Sunshine and rainbows.	white	1	base
19131	Surprise sex!	white	1	base
19132	Swag.	white	1	base
19133	Swamp ass.	white	1	base
19134	Sweet, sweet vengeance.	white	1	base
19135	Switching to Geico®.	white	1	base
19136	Swooping.	white	1	base
19137	Synergistic management solutions.	white	1	base
19138	Syrupy sex with a maple tree.	white	1	base
19139	Take-backsies.	white	1	base
19140	Taking a man's eyes and balls out and putting his eyes where his balls go and then his balls in the eye holes.	white	1	base
19141	Taking a sheep-wife.	white	1	base
19142	Taking off your shirt.	white	1	base
19143	Tangled Slinkys.	white	1	base
19144	Tap dancing like there's no tomorrow.	white	1	base
19145	Tasteful sideboob.	white	1	base
19146	Teaching a robot to love.	white	1	base
19147	Team building exercises.	white	1	base
19148	Team-building exercises.	white	1	base
19149	Tearing that ass up like wrapping paper on Christmas morning.	white	1	base
19150	Teenage pregnancy.	white	1	base
19151	Telling a shitty story that goes nowhere.	white	1	base
19152	Tentacle porn, but it's actually educational.	white	1	base
19153	Tentacle porn.	white	1	base
19154	Terrorists.	white	1	base
19155	Terry Fox's prosthetic leg.	white	1	base
19156	Testicular torsion.	white	1	base
19157	That ass.	white	1	base
19158	That mustache.	white	1	base
19159	That one coworker who keeps making 'jokes.'	white	1	base
19160	That one friend who always talks about their breast reduction.	white	1	base
19161	That one gay Teletubby.	white	1	base
19162	That one lobby where everyone is named 'your mom.'	white	1	base
19163	That one person who types entire essays in general chat.	white	1	base
19164	That thing that electrocutes your abs.	white	1	base
19165	The American Dream.	white	1	base
19166	The Amish.	white	1	base
19167	The Bachelorette season finale.	white	1	base
19168	The Big Bang.	white	1	base
19169	The Black Death.	white	1	base
19170	The Blood of Christ.	white	1	base
19171	The Boy Scouts of America.	white	1	base
19172	The Care Bear Stare.	white	1	base
19173	The Chinese gymnastics team.	white	1	base
19174	The Confederate flag.	white	1	base
19175	The Daily Mail.	white	1	base
19176	The Dalai Lama.	white	1	base
19177	The Dance of the Sugar Plum Fairy.	white	1	base
19178	The Devil Himself.	white	1	base
19179	The Donald Trump Seal of Approval.™	white	1	base
19180	The EDL.	white	1	base
19181	The FLQ.	white	1	base
19182	The Force.	white	1	base
19183	The French.	white	1	base
19184	The Great Depression.	white	1	base
19185	The Great Emu War.	white	1	base
19187	The HOA's suspiciously specific 'neighborhood watch' rules.	white	1	base
19188	The Hamburglar.	white	1	base
19189	The Hemsworth brothers.	white	1	base
19190	The Hillsborough Disaster.	white	1	base
19191	The Holy Bible.	white	1	base
19192	The Honey Monster.	white	1	base
19193	The Hustle.	white	1	base
19194	The Jews.	white	1	base
19195	The KKK.	white	1	base
19196	The Kool-Aid Man.	white	1	base
19197	The Little Engine That Could.	white	1	base
19198	The Make-A-Wish® Foundation.	white	1	base
19199	The Official Languages Act. La Loi sur les langues officielles.	white	1	base
19200	The Patriarchy.	white	1	base
19201	The People's Elbow.	white	1	base
19202	The Pope.	white	1	base
19203	The Rapture.	white	1	base
19204	The Red Hot Chili Peppers.	white	1	base
19205	The Red Menace.	white	1	base
19206	The Rev. Dr. Martin Luther King, Jr.	white	1	base
19207	The Royal Canadian Mounted Police.	white	1	base
19208	The Russians.	white	1	base
19209	The Scouts.	white	1	base
19210	The Smell of a Primark.	white	1	base
19211	The Stig.	white	1	base
19212	The Strictly Come Dancing final.	white	1	base
19213	The Strictly Come Dancing season finale.	white	1	base
19214	The Superdome.	white	1	base
19215	The Tempur-Pedic® Swedish Sleep System™.	white	1	base
19216	The Thong Song.	white	1	base
19217	The Three-Fifths compromise.	white	1	base
19218	The Trail of Tears.	white	1	base
19219	The Underground Railroad.	white	1	base
19220	The Virginia Tech Massacre.	white	1	base
19221	The Welsh.	white	1	base
19222	The Wendy's Spicy Chicken Sandwich.	white	1	base
19223	The White Australia Policy.	white	1	base
19224	The World of Warcraft.	white	1	base
19225	The admin who nukes the entire server over a meme.	white	1	base
19226	The ancient art of the titty drop.	white	1	base
19227	The arrival of the pizza.	white	1	base
19228	The art of seduction.	white	1	base
19229	The awkward moment when you realize you've been talking to a mannequin.	white	1	base
19230	The awkward silence after a failed high-five.	white	1	base
19231	The awkward underboob sweat situation.	white	1	base
19232	The awkwardness of a first date with a flat-earther's ex.	white	1	base
19233	The awkwardness of a high-five turned into a handshake.	white	1	base
19234	The awkwardness of seeing your teacher at a strip club.	white	1	base
19235	The baby that ruined my pussy.	white	1	base
19236	The bastard seagull who stole my chips.	white	1	base
19237	The big fucking hole in the ozone layer.	white	1	base
19238	The bloody Welsh.	white	1	base
19239	The bombing of Nagasaki.	white	1	base
19240	The boners of the elderly.	white	1	base
19241	The boob jiggle physics in every video game.	white	1	base
19242	The bush.	white	1	base
19243	The chronic.	white	1	base
19244	The clitoris.	white	1	base
19245	The concept of time as a flat pancake.	white	1	base
19246	The cool, refreshing taste of Coca-Cola®.	white	1	base
19247	The crazy, ball-slapping sex your parents are having right now.	white	1	base
19248	The crushing disappointment of a fortune cookie with no fortune.	white	1	base
19249	The crushing disappointment of a half-eaten sandwich.	white	1	base
19250	The crushing disappointment of a participation trophy.	white	1	base
19251	The crushing disappointment of a sugar-free gummy bear.	white	1	base
19252	The crushing realization that you forgot to mute your mic.	white	1	base
19253	The crushing realization that you're an NPC.	white	1	base
19254	The crushing realization that your search history is public.	white	1	base
19255	The crushing weight of student debt.	white	1	base
19256	The dead body in the cafeteria that everyone walks past.	white	1	base
19257	The death penalty.	white	1	base
19258	The deformed.	white	1	base
19259	The drama club.	white	1	base
19260	The economy.	white	1	base
19261	The end of days.	white	1	base
19262	The entire Internet.	white	1	base
19263	The entire Mormon Tabernacle Choir.	white	1	base
19264	The entire cast of Downton Abbey.	white	1	base
19265	The existential dread of a Monday morning.	white	1	base
19266	The existential dread of being replaced by Ghosty Bot.	white	1	base
19267	The feeling of a brain freeze.	white	1	base
19268	The feeling of a cold breeze on a warm night.	white	1	base
19269	The feeling of a cold drop of water down your back.	white	1	base
19270	The feeling of a cold hand on your lower back.	white	1	base
19271	The feeling of a cold hand on your neck in a crowded room.	white	1	base
19272	The feeling of a cold toilet seat at 3 AM.	white	1	base
19273	The feeling of a cold wind on a bald head.	white	1	base
19274	The feeling of a cold wind on a sweaty back.	white	1	base
19275	The feeling of a cold wind on your face.	white	1	base
19276	The feeling of a cold, wet tongue in your ear.	white	1	base
19277	The feeling of a phantom limb.	white	1	base
19278	The feeling of a phantom phone vibration.	white	1	base
19279	The feeling of a single breadcrumb in your bed.	white	1	base
19280	The feeling of a single crumb in your shoe.	white	1	base
19281	The feeling of a single hair on your face you can't find.	white	1	base
19282	The feeling of a soft blanket.	white	1	base
19283	The feeling of a soft, fuzzy peach.	white	1	base
19284	The feeling of a soft, warm kitten.	white	1	base
19285	The feeling of a sudden breeze.	white	1	base
19286	The feeling of a sunburn.	white	1	base
19287	The feeling of being a background character in someone else's life.	white	1	base
19288	The feeling of being the only person at a party who isn't wearing a costume.	white	1	base
19289	The feeling of being the only person who didn't get the joke.	white	1	base
19290	The feeling of being touched by a ghost in a suggestive way.	white	1	base
19291	The feeling of being watched by a goldfish.	white	1	base
19292	The feeling of dry skin on a chalkboard.	white	1	base
19293	The feeling of sand in your bed.	white	1	base
19294	The feeling of velvet on your teeth.	white	1	base
19295	The feeling of wet bread in your mouth.	white	1	base
19296	The feeling of wet socks on a cold day.	white	1	base
19297	The female orgasm.	white	1	base
19298	The flute.	white	1	base
19299	The folly of man.	white	1	base
19300	The forbidden fruit.	white	1	base
19301	The friend who always says 'this is the best weed I've ever had.'	white	1	base
19302	The friend who tells everyone who killed them on a Discord call.	white	1	base
19303	The gays.	white	1	base
19304	The ghost of Christmas future's student loans.	white	1	base
19305	The ghost of Jeffrey Epstein.	white	1	base
19306	The glass ceiling.	white	1	base
19307	The guy who always calls emergency meetings for no reason.	white	1	base
19308	The guy who brings a gravity bong to every party.	white	1	base
19309	The guy who mic spams in every voice chat.	white	1	base
19310	The guys from Queer Eye.	white	1	base
19311	The hardworking Mexican.	white	1	base
19312	The heart of a child.	white	1	base
19313	The hiccups.	white	1	base
19314	The homosexual agenda.	white	1	base
19315	The homosexual lifestyle.	white	1	base
19316	The human body.	white	1	base
19317	The illusion of choice in a late-stage capitalist society.	white	1	base
19318	The impostor who kills in front of everyone and blames it on lag.	white	1	base
19319	The inevitable heat death of the universe.	white	1	base
19320	The invisible hand.	white	1	base
19321	The land of chocolate.	white	1	base
19322	The light of a billion suns.	white	1	base
19323	The magic of live theatre.	white	1	base
19324	The milk man.	white	1	base
19325	The milkman.	white	1	base
19326	The miracle of childbirth.	white	1	base
19327	The mod who dates server members.	white	1	base
19328	The morbidly obese.	white	1	base
19329	The mystery of where the other sock goes.	white	1	base
19330	The one friend who says 'I don't see color.'	white	1	base
19331	The only gay person in a hundred kilometers.	white	1	base
19332	The opioid epidemic.	white	1	base
19333	The overwhelming urge to poke a sleeping bear.	white	1	base
19334	The paranoia of hearing a knock at the door while smoking.	white	1	base
19335	The past.	white	1	base
19336	The penny whistle solo from "My Heart Will Go On."	white	1	base
19337	The petty troubles of the aristrocracy.	white	1	base
19338	The petty troubles of the landed gentry.	white	1	base
19339	The pirate's life.	white	1	base
19340	The placenta.	white	1	base
19341	The plot of a Michael Bay movie.	white	1	base
19342	The profoundly handicapped.	white	1	base
19343	The prostate.	white	1	base
19344	The prunes I've been saving for you in my armpits.	white	1	base
19345	The rhythms of Africa.	white	1	base
19346	The scent of a burning dumpster.	white	1	base
19347	The scent of a thunderstorm.	white	1	base
19348	The scent of a wet basement.	white	1	base
19349	The scent of a wet wool sweater.	white	1	base
19350	The scent of desperation and cheap cologne.	white	1	base
19351	The screams...the terrible screams.	white	1	base
19352	The secret life of house plants.	white	1	base
19353	The sheer audacity of a pigeon.	white	1	base
19354	The sheer, unadulterated joy of popping a giant zit.	white	1	base
19355	The sight of a bird flying into a window.	white	1	base
19356	The sight of a bird in the sky.	white	1	base
19357	The sight of a bird wearing glasses.	white	1	base
19358	The sight of a bird with a piece of bread.	white	1	base
19359	The sight of a bird with a worm.	white	1	base
19360	The sight of a cat chasing its own tail in circles.	white	1	base
19361	The sight of a cat in a bathtub.	white	1	base
19362	The sight of a cat in a business suit.	white	1	base
19363	The sight of a dog in sunglasses.	white	1	base
19364	The sight of a dog wearing a sweater.	white	1	base
19365	The sight of a man in a tutu walking a goldfish.	white	1	base
19366	The sight of a man trying to argue with a tree.	white	1	base
19367	The sight of a man trying to fight a cloud.	white	1	base
19368	The sight of a man trying to reason with a brick wall.	white	1	base
19369	The sight of a pigeon wearing a tiny backpack.	white	1	base
19370	The slow, rhythmic tapping of a leaky faucet.	white	1	base
19371	The smell of a gym bag left in the sun.	white	1	base
19372	The smell of a locker room after a game of professional wrestling.	white	1	base
19373	The smell of a locker room in August.	white	1	base
19374	The smell of a used bookstore.	white	1	base
19375	The smell of a used diaper in a hot car.	white	1	base
19376	The smell of a wet dog in a crowded elevator.	white	1	base
19377	The smell of desperation and cheap tequila.	white	1	base
19378	The smell of old gym socks.	white	1	base
19379	The smell of old spice and regret.	white	1	base
19380	The smell of rotting garbage and expensive perfume.	white	1	base
19381	The smell of sulfur and used condoms.	white	1	base
19382	The smell of wet dog and ozone.	white	1	base
19383	The sound of a baby laughing in a dark room.	white	1	base
19384	The sound of a clock ticking in a library.	white	1	base
19385	The sound of a clock ticking in an empty house.	white	1	base
19386	The sound of a clock ticking slightly out of sync.	white	1	base
19387	The sound of a dial-up modem in the middle of a seance.	white	1	base
19388	The sound of a distant thunderclap.	white	1	base
19389	The sound of a flute played poorly.	white	1	base
19390	The sound of a kazoo orchestra.	white	1	base
19391	The sound of a recorder being played by a five-year-old.	white	1	base
19392	The sound of a recorder being played in a tunnel.	white	1	base
19393	The sound of a single clap in a quiet theater.	white	1	base
19394	The sound of a single leaf falling.	white	1	base
19395	The sound of a single popcorn kernel popping.	white	1	base
19396	The sound of a single, echoing sneeze.	white	1	base
19397	The sound of a single, high-pitched scream.	white	1	base
19398	The sound of a single, low-pitched hum.	white	1	base
19399	The sound of a thousand kazoos playing 'Entry of the Gladiators'.	white	1	base
19400	The sound of a thousand kazoos playing 'My Heart Will Go On'.	white	1	base
19401	The sound of a thousand people whispering your name.	white	1	base
19402	The sound of a typewriter in a coffee shop.	white	1	base
19403	The sound of a typewriter in a library.	white	1	base
19404	The sound of a typewriter in a modern office.	white	1	base
19405	The sound of a vuvuzela.	white	1	base
19406	The sound of a wet fart in a yoga class.	white	1	base
19407	The sound of a wet noodle hitting a bald head.	white	1	base
19408	The sound of a wet shoe squeaking.	white	1	base
19409	The sound of a wet slap.	white	1	base
19410	The sound of a wet sponge hitting a tile floor.	white	1	base
19411	The sound of a whistle blowing in the distance.	white	1	base
19412	The sound of one hand clapping, but it's just a wet slap.	white	1	base
19413	The sound of silence, but louder.	white	1	base
19414	The south.	white	1	base
19415	The specific smell of a damp basement.	white	1	base
19416	The specific taste of copper and shame.	white	1	base
19417	The subtle art of not giving a f*ck.	white	1	base
19418	The sudden appearance of the Go Compare man.	white	1	base
19419	The sudden realization that you're in a cult.	white	1	base
19420	The sudden urge to break into song in a public restroom.	white	1	base
19421	The sudden urge to dance in an elevator.	white	1	base
19422	The sudden urge to scream 'PUDDING!' at a funeral.	white	1	base
19423	The sudden urge to scream into a void.	white	1	base
19424	The taint; the grundle; the fleshy fun-bridge.	white	1	base
19425	The tampon from my vagina.	white	1	base
19426	The taste of a battery on a dare.	white	1	base
19427	The taste of a bitter orange.	white	1	base
19428	The taste of a cherry.	white	1	base
19429	The taste of a cloud.	white	1	base
19430	The taste of a copper penny after a long run.	white	1	base
19431	The taste of a copper penny.	white	1	base
19432	The taste of a dusty cracker.	white	1	base
19433	The taste of a lemon-scented cleaning product.	white	1	base
19434	The taste of a mouthwash-flavored lollipop.	white	1	base
19435	The taste of a salty watermelon.	white	1	base
19436	The taste of a soap-flavored jelly bean.	white	1	base
19437	The taste of a sour grape.	white	1	base
19438	The taste of a stale marshmallow.	white	1	base
19439	The taste of a sweet strawberry.	white	1	base
19440	The taste of a tart apple.	white	1	base
19441	The taste of a toothpaste-flavored donut.	white	1	base
19442	The taste of a used band-aid.	white	1	base
19443	The taste of an apple.	white	1	base
19444	The taste of cold coffee.	white	1	base
19445	The taste of iron and regret.	white	1	base
19446	The taste of lukewarm tea.	white	1	base
19447	The taste of success, but it's just sugar-coated lies.	white	1	base
19448	The taste of success, which is mostly salt.	white	1	base
19449	The terrifying realization that you're turning into your parents.	white	1	base
19450	The terrifying sight of a clown with a balloon animal that's actually a real animal.	white	1	base
19451	The terrifying sight of a clown with a chainsaw.	white	1	base
19452	The terrifying sound of a child's laughter in an abandoned asylum.	white	1	base
19453	The terrorists.	white	1	base
19454	The token minority.	white	1	base
19455	The total collapse of the global financial system.	white	1	base
19456	The true meaning of Christmas.	white	1	base
19457	The ugliest boy in town,	white	1	base
19458	The unstoppable tide of Islam.	white	1	base
19459	The unwritten rule of 'puff puff pass.'	white	1	base
19460	The violation of our most basic human rights.	white	1	base
19461	The way James Bond treats women.	white	1	base
19462	The wet, slapping sound of a fish on pavement.	white	1	base
19463	The wet, squelching sound of a swamp.	white	1	base
19464	The white savior complex.	white	1	base
19465	The whole enchilada.	white	1	base
19466	The wifi password.	white	1	base
19467	The wonders of the Orient.	white	1	base
19468	The wrath of Vladimir Putin.	white	1	base
19469	The Übermensch.	white	1	base
19470	Therapy.	white	1	base
19471	Theresa May.	white	1	base
19472	These hoes.	white	1	base
19473	The BNP.	white	1	base
19474	The North.	white	1	base
19475	Third base.	white	1	base
19476	This answer is postmodern.	white	1	base
19477	This month's mass shooting.	white	1	base
19478	This year's mass shooting.	white	1	base
19479	Those times when you get sand in your vagina.	white	1	base
19480	Three dicks at the same time.	white	1	base
19481	Three ounces of clean urine.	white	1	base
19482	Throwing a virgin into a volcano.	white	1	base
19483	Throwing grapes at a man until he loses touch with reality.	white	1	base
19484	Tickle Me Elmo™.	white	1	base
19485	Tickling Sean Hannity, even after he tells you to stop.	white	1	base
19486	Tiger Woods.	white	1	base
19487	Tiny nipples.	white	1	base
19488	Tiny tits that say "Yippee!" when you touch them.	white	1	base
19489	Tom Cruise.	white	1	base
19490	Tongue.	white	1	base
19491	Toni Morrison's vagina.	white	1	base
19492	Tony Abbott in budgie smugglers.	white	1	base
19493	Too much hair gel.	white	1	base
19494	Tories.	white	1	base
19495	Total control of the media.	white	1	base
19496	Touching a pug right on his penis.	white	1	base
19497	Toxic masculinity	white	1	base
19498	Treating Ghosty Bot like your therapist.	white	1	base
19499	Trench foot.	white	1	base
19500	Tripping balls.	white	1	base
19501	Trying to act sober in front of your parents while absolutely zooted.	white	1	base
19502	Twenty tonnes of bat shit.	white	1	base
19503	Twinkies®.	white	1	base
19504	Two Xanax and a bottle of wine.	white	1	base
19505	Two midgets shitting into a bucket.	white	1	base
19506	Unexpectedly getting an erection during a job interview.	white	1	base
19507	Unfathomable stupidity.	white	1	base
19508	Unprotected sex with a stranger.	white	1	base
19509	Uppercuts.	white	1	base
19510	Used panties.	white	1	base
19511	Used knickers.	white	1	base
19512	Using Tabasco sauce as lube.	white	1	base
19513	Using a cactus as a dildo.	white	1	base
19514	Using a condom.	white	1	base
19515	Using a glock as a sex toy.	white	1	base
19516	Using cleavage as a pocket for your phone.	white	1	base
19517	Using comedy as a coping mechanism.	white	1	base
19518	Using eye drops like your life depends on it.	white	1	base
19519	Vegemite™.	white	1	base
19520	Vehicular homicide.	white	1	base
19521	Vehicular manslaughter.	white	1	base
19522	Venting in electrical.	white	1	base
19523	Viagra®.	white	1	base
19524	Vigilante justice.	white	1	base
19525	Vigorous jazz hands.	white	1	base
19526	Vikings.	white	1	base
19527	Vladimir Putin.	white	1	base
19528	Vomiting into a kangaroo's pouch.	white	1	base
19529	Vomiting mid-blowjob.	white	1	base
19530	Vomiting seafood and bleeding anally.	white	1	base
19531	Waiting 'til marriage.	white	1	base
19532	Waiting till marriage.	white	1	base
19533	Waking up half-naked in a Denny's parking lot.	white	1	base
19534	Waking up half-naked in a Wetherspoons car park.	white	1	base
19535	Waking up half-naked in a Little Chef car park.	white	1	base
19536	Waking up in Idris Elba's arms.	white	1	base
19537	Waking up in a bathtub full of ice and missing a kidney.	white	1	base
19538	Walking in on Dad peeing into Mom's mouth.	white	1	base
19539	Wanking into a pool of children's tears.	white	1	base
19540	Watching someone do the wires task for the 47th time.	white	1	base
19541	Waterboarding.	white	1	base
19542	Weaponized sideboob.	white	1	base
19543	Weapons-grade plutonium.	white	1	base
19544	Wearing an octopus for a hat.	white	1	base
19545	Wearing underwear inside out to avoid doing laundry.	white	1	base
19546	Wearing underwear inside-out to avoid doing laundry.	white	1	base
19547	Website.	white	1	base
19548	Wet dreams.	white	1	base
19549	What that mouth do.	white	1	base
19550	What's left of the Great Barrier Reef.	white	1	base
19551	Whatever's in the fridge.	white	1	base
19552	When you fart and a little bit comes out.	white	1	base
19553	Whining like a little bitch.	white	1	base
19554	Whipping it out.	white	1	base
19555	Whiskas® Catmilk.	white	1	base
19556	White people.	white	1	base
19557	White power.	white	1	base
19558	White privilege.	white	1	base
19559	White-man scalps.	white	1	base
19560	Whoever the Prime Minister is these days.	white	1	base
19561	Wifely duties.	white	1	base
19562	Will Smith.	white	1	base
19563	William Shatner.	white	1	base
19564	Willie Nelson's tour bus air freshener bill.	white	1	base
19565	Winking at old people.	white	1	base
19566	Wiping her butt.	white	1	base
19567	Wiping her bum.	white	1	base
19568	Wizard music.	white	1	base
19569	Women in yoghurt commercials.	white	1	base
19570	Women in yogurt commercials.	white	1	base
19571	Women in yoghurt adverts.	white	1	base
19572	Women of color.	white	1	base
19573	Women of colour.	white	1	base
19574	Women voting.	white	1	base
19575	Women's suffrage.	white	1	base
19576	Women's undies.	white	1	base
19577	Wondering if it's possible to get some of that salsa to go.	white	1	base
19578	Words.	white	1	base
19579	Working in an Amazon warehouse.	white	1	base
19580	World peace.	white	1	base
19581	Worshipping that pussy.	white	1	base
19582	Xenophobia.	white	1	base
19583	YOU MUST CONSTRUCT ADDITIONAL PYLONS.	white	1	base
19584	Yeast.	white	1	base
19585	Your mom.	white	1	base
19586	Your mum.	white	1	base
19587	Your racist uncle's Facebook posts.	white	1	base
19588	Your stoner friend who thinks weed cures everything.	white	1	base
19589	Your weird brother.	white	1	base
\.


--
-- Data for Name: games; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.games (id, guild_id, channel_id, status, judge_id, current_black_card_id, created_at, points_to_win) FROM stdin;
\.


--
-- Data for Name: hands; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hands (id, player_id, card_id) FROM stdin;
\.


--
-- Data for Name: played_cards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.played_cards (id, game_id, player_id, card_id) FROM stdin;
\.


--
-- Data for Name: players; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.players (id, game_id, user_id, username, score, is_vip) FROM stdin;
\.


--
-- Name: cards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cards_id_seq', 19589, true);


--
-- Name: games_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.games_id_seq', 29, true);


--
-- Name: hands_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hands_id_seq', 1895, true);


--
-- Name: played_cards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.played_cards_id_seq', 1020, true);


--
-- Name: players_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.players_id_seq', 146, true);


--
-- Name: cards cards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_pkey PRIMARY KEY (id);


--
-- Name: games games_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_pkey PRIMARY KEY (id);


--
-- Name: hands hands_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hands
    ADD CONSTRAINT hands_pkey PRIMARY KEY (id);


--
-- Name: played_cards played_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.played_cards
    ADD CONSTRAINT played_cards_pkey PRIMARY KEY (id);


--
-- Name: players players_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_pkey PRIMARY KEY (id);


--
-- Name: games games_current_black_card_id_cards_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_current_black_card_id_cards_id_fk FOREIGN KEY (current_black_card_id) REFERENCES public.cards(id);


--
-- Name: hands hands_card_id_cards_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hands
    ADD CONSTRAINT hands_card_id_cards_id_fk FOREIGN KEY (card_id) REFERENCES public.cards(id);


--
-- Name: hands hands_player_id_players_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hands
    ADD CONSTRAINT hands_player_id_players_id_fk FOREIGN KEY (player_id) REFERENCES public.players(id);


--
-- Name: played_cards played_cards_card_id_cards_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.played_cards
    ADD CONSTRAINT played_cards_card_id_cards_id_fk FOREIGN KEY (card_id) REFERENCES public.cards(id);


--
-- Name: played_cards played_cards_game_id_games_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.played_cards
    ADD CONSTRAINT played_cards_game_id_games_id_fk FOREIGN KEY (game_id) REFERENCES public.games(id);


--
-- Name: played_cards played_cards_player_id_players_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.played_cards
    ADD CONSTRAINT played_cards_player_id_players_id_fk FOREIGN KEY (player_id) REFERENCES public.players(id);


--
-- Name: players players_game_id_games_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT players_game_id_games_id_fk FOREIGN KEY (game_id) REFERENCES public.games(id);


--
-- PostgreSQL database dump complete
--

\unrestrict yEvlbJk2z5yI4zSaQhkbNQyOpnrEUV0YYVwV7efVUQ2FNRudG2yHE94wPxRMHsi

