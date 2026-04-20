#!/usr/bin/env python3
import json, os, glob

DATA = os.path.join(os.path.dirname(__file__), 'data')

THEORY = {
    "Present Perfect I": {
        "explanation": (
            "Present Perfect – czas teraźniejszy doskonały\n\n"
            "Budowa: have / has + past participle (3. forma czasownika)\n\n"
            "Kiedy używamy:\n"
            "  • Doświadczenia życiowe (ever, never): \"Have you ever been abroad?\"\n"
            "  • Czynności właśnie zakończone (just, already): \"I've just finished.\"\n"
            "  • Skutek widoczny teraz: \"She has lost her keys.\" (i wciąż ich nie ma)\n"
            "  • Czas trwający do teraz (for, since): \"I've lived here for ten years.\"\n\n"
            "Formy:\n"
            "  Twierdzące:  I/You/We/They have + pp    |  He/She/It has + pp\n"
            "  Przeczące:   haven't + pp               |  hasn't + pp\n"
            "  Pytania:     Have + podmiot + pp?        |  Has + podmiot + pp?"
        ),
        "examples": [
            {"sentence": "I have seen this film before.", "explanation": "Twierdzące: I + have + seen (pp od 'see'). Opisuje doświadczenie z przeszłości."},
            {"sentence": "She hasn't cooked dinner yet.", "explanation": "Przeczące: she + hasn't + cooked (pp od 'cook'). Yet = jeszcze nie – stoi na końcu."},
            {"sentence": "Have they ever been to London?", "explanation": "Pytanie: Have + they + been (pp od 'go/be'). Ever = kiedykolwiek – stoi po have/has."}
        ]
    },
    "Present Perfect II": {
        "explanation": (
            "Present Perfect – czas teraźniejszy doskonały\n\n"
            "Budowa: have / has + past participle (3. forma czasownika)\n\n"
            "Kiedy używamy:\n"
            "  • Doświadczenia życiowe (ever, never): \"Have you ever been abroad?\"\n"
            "  • Czynności właśnie zakończone (just, already): \"I've just finished.\"\n"
            "  • Skutek widoczny teraz: \"She has lost her keys.\" (i wciąż ich nie ma)\n"
            "  • Czas trwający do teraz (for, since): \"I've lived here for ten years.\"\n\n"
            "Formy:\n"
            "  Twierdzące:  I/You/We/They have + pp    |  He/She/It has + pp\n"
            "  Przeczące:   haven't + pp               |  hasn't + pp\n"
            "  Pytania:     Have + podmiot + pp?        |  Has + podmiot + pp?"
        ),
        "examples": [
            {"sentence": "He's found a great new job.", "explanation": "Twierdzące: he + has (= he's) + found (pp od 'find'). Skutek widoczny teraz."},
            {"sentence": "Have you ever ridden a horse?", "explanation": "Pytanie z ever: Have + you + ridden (pp od 'ride'). Ever stoi po have/has."},
            {"sentence": "She hasn't passed her driving test yet.", "explanation": "Przeczące: she + hasn't + passed + yet. Yet = jeszcze nie – zawsze na końcu."}
        ]
    },
    "Present Perfect – for and since I": {
        "explanation": (
            "FOR i SINCE w Present Perfect\n\n"
            "Obu używamy z Present Perfect, by opisać jak długo coś trwa.\n\n"
            "FOR + przedział czasu (jak długo?):\n"
            "  for two hours, for ten years, for a long time, for ages\n\n"
            "SINCE + punkt w czasie (od kiedy?):\n"
            "  since Monday, since 2010, since I was a child, since breakfast\n\n"
            "Wskazówka: zapytaj siebie:\n"
            "  \"Jak długo?\" → FOR\n"
            "  \"Od kiedy?\" → SINCE"
        ),
        "examples": [
            {"sentence": "I have lived here for ten years.", "explanation": "FOR + okres czasu (ten years). Odpowiada na pytanie: jak długo?"},
            {"sentence": "She has worked there since January.", "explanation": "SINCE + punkt w czasie (January). Odpowiada na pytanie: od kiedy?"},
            {"sentence": "He hasn't spoken to her since the argument.", "explanation": "SINCE + zdarzenie (argument). Zdarzenie to punkt startowy, od którego coś trwa."}
        ]
    },
    "Present Perfect – for and since II": {
        "explanation": (
            "FOR i SINCE w Present Perfect\n\n"
            "Obu używamy z Present Perfect, by opisać jak długo coś trwa.\n\n"
            "FOR + przedział czasu (jak długo?):\n"
            "  for two hours, for ten years, for a long time, for ages\n\n"
            "SINCE + punkt w czasie (od kiedy?):\n"
            "  since Monday, since 2010, since I was a child, since breakfast\n\n"
            "Wskazówka: zapytaj siebie:\n"
            "  \"Jak długo?\" → FOR\n"
            "  \"Od kiedy?\" → SINCE"
        ),
        "examples": [
            {"sentence": "He hasn't called me for weeks.", "explanation": "FOR + okres czasu (weeks). Jak długo nie dzwonił?"},
            {"sentence": "It hasn't rained here since March.", "explanation": "SINCE + punkt w czasie (March). Od kiedy nie pada?"},
            {"sentence": "I have known him since we were at school.", "explanation": "SINCE + zdanie podrzędne (since + subject + verb). Od kiedy go znam?"}
        ]
    },
    "Present Simple – ever, never, already, yet I": {
        "explanation": (
            "Przysłówki w Present Perfect: ever, never, already, yet\n\n"
            "EVER = kiedykolwiek\n"
            "  → w pytaniach, po have/has: \"Have you ever been to Japan?\"\n\n"
            "NEVER = nigdy\n"
            "  → w zdaniach twierdzących (samo w sobie jest przeczeniem!)\n"
            "  → po have/has: \"I have never eaten sushi.\"\n\n"
            "ALREADY = już (wcześniej niż oczekiwano)\n"
            "  → w twierdzeniach, po have/has: \"She has already left.\"\n\n"
            "YET = jeszcze nie / już (w pytaniach)\n"
            "  → na końcu zdania przeczącego lub pytającego\n"
            "  → \"I haven't finished yet.\"  /  \"Has he arrived yet?\""
        ),
        "examples": [
            {"sentence": "Do you ever watch films in English?", "explanation": "EVER w pytaniu z do/does. Stoi po do/does, przed czasownikiem głównym."},
            {"sentence": "I've already done the washing up.", "explanation": "ALREADY w twierdzeniu. Stoi po have/has, przed past participle."},
            {"sentence": "Have you had a shower yet?", "explanation": "YET w pytaniu. Stoi na końcu zdania."}
        ]
    },
    "Present Simple – ever, never, already, yet II": {
        "explanation": (
            "Przysłówki w Present Perfect: ever, never, already, yet\n\n"
            "EVER = kiedykolwiek\n"
            "  → w pytaniach, po have/has: \"Have you ever been to Japan?\"\n\n"
            "NEVER = nigdy\n"
            "  → w zdaniach twierdzących (samo w sobie jest przeczeniem!)\n"
            "  → po have/has: \"I have never eaten sushi.\"\n\n"
            "ALREADY = już (wcześniej niż oczekiwano)\n"
            "  → w twierdzeniach, po have/has: \"She has already left.\"\n\n"
            "YET = jeszcze nie / już (w pytaniach)\n"
            "  → na końcu zdania przeczącego lub pytającego\n"
            "  → \"I haven't finished yet.\"  /  \"Has he arrived yet?\""
        ),
        "examples": [
            {"sentence": "She never uses the dishwasher.", "explanation": "NEVER w twierdzeniu z present simple (3. os. l.poj. → uses). Stoi przed czasownikiem głównym."},
            {"sentence": "They've already booked the hotel.", "explanation": "ALREADY w twierdzeniu Present Perfect. Stoi po have/has, przed past participle."},
            {"sentence": "Have you spoken to your manager yet?", "explanation": "YET w pytaniu Present Perfect. Stoi na końcu zdania."}
        ]
    },
    "Past Perfect I": {
        "explanation": (
            "Past Perfect – czas przeszły doskonały\n\n"
            "Budowa: had + past participle (3. forma czasownika)\n"
            "Skrót: I'd, she'd, they'd...\n\n"
            "Kiedy używamy:\n"
            "Opisujemy czynność, która zakończyła się PRZED inną czynnością w przeszłości.\n"
            "Past Perfect = \"wcześniejsza przeszłość\"\n\n"
            "Słowa kluczowe: before, after, when, by the time, already, just, never\n\n"
            "Formy:\n"
            "  Twierdzące:  podmiot + had + pp\n"
            "  Przeczące:   podmiot + hadn't + pp\n"
            "  Pytania:     Had + podmiot + pp?"
        ),
        "examples": [
            {"sentence": "By the time I arrived, she had already left.", "explanation": "Left (Past Perfect) nastąpiło PRZED arrived (Past Simple). Kolejność: najpierw left, potem arrived."},
            {"sentence": "He hadn't seen snow before he moved to Canada.", "explanation": "Przeczące: hadn't + seen. Brak doświadczenia przed określonym momentem w przeszłości."},
            {"sentence": "Had you read the book before the exam?", "explanation": "Pytanie: Had + podmiot + past participle. Czy czynność była zakończona przed innym wydarzeniem?"}
        ]
    },
    "Past Perfect II": {
        "explanation": (
            "Past Perfect – czas przeszły doskonały\n\n"
            "Budowa: had + past participle (3. forma czasownika)\n"
            "Skrót: I'd, she'd, they'd...\n\n"
            "Kiedy używamy:\n"
            "Opisujemy czynność, która zakończyła się PRZED inną czynnością w przeszłości.\n"
            "Past Perfect = \"wcześniejsza przeszłość\"\n\n"
            "Słowa kluczowe: before, after, when, by the time, already, just, never\n\n"
            "Formy:\n"
            "  Twierdzące:  podmiot + had + pp\n"
            "  Przeczące:   podmiot + hadn't + pp\n"
            "  Pytania:     Had + podmiot + pp?"
        ),
        "examples": [
            {"sentence": "They were late because they had missed the train.", "explanation": "Missed (Past Perfect) = przyczyna. Była to wcześniejsza czynność, before being late."},
            {"sentence": "I felt sick because I had eaten too much.", "explanation": "Had eaten (Past Perfect) → wcześniej. Felt sick (Past Simple) → skutek."},
            {"sentence": "Had she spoken to the manager before she resigned?", "explanation": "Pytanie: Had + podmiot + spoken. Czy ta czynność wydarzyła się przed inną?"}
        ]
    },
    "Future Perfect I": {
        "explanation": (
            "Future Perfect – czas przyszły doskonały\n\n"
            "Budowa: will have + past participle (3. forma czasownika)\n"
            "Skrót: I'll have, she'll have...\n\n"
            "Kiedy używamy:\n"
            "Opisujemy czynność, która zostanie zakończona PRZED określonym momentem w przyszłości.\n\n"
            "Typowe wyrażenia czasu:\n"
            "  by next year, by the time, by 2030, by Friday, before the meeting\n\n"
            "Formy:\n"
            "  Twierdzące:  podmiot + will have + pp\n"
            "  Przeczące:   podmiot + won't have + pp\n"
            "  Pytania:     Will + podmiot + have + pp?"
        ),
        "examples": [
            {"sentence": "By next year, I will have finished my studies.", "explanation": "Twierdzące: will have + finished (pp). Czynność zakończona przed \"next year\"."},
            {"sentence": "They will not have finished dinner before we arrive.", "explanation": "Przeczące: won't have + finished. Czynność NIE zostanie zakończona przed danym momentem."},
            {"sentence": "Will you have eaten by 7 pm?", "explanation": "Pytanie: Will + podmiot + have + past participle? Czy czynność będzie zakończona przed podanym czasem?"}
        ]
    },
    "Future Perfect II": {
        "explanation": (
            "Future Perfect – czas przyszły doskonały\n\n"
            "Budowa: will have + past participle (3. forma czasownika)\n"
            "Skrót: I'll have, she'll have...\n\n"
            "Kiedy używamy:\n"
            "Opisujemy czynność, która zostanie zakończona PRZED określonym momentem w przyszłości.\n\n"
            "Typowe wyrażenia czasu:\n"
            "  by next year, by the time, by 2030, by Friday, before the meeting\n\n"
            "Formy:\n"
            "  Twierdzące:  podmiot + will have + pp\n"
            "  Przeczące:   podmiot + won't have + pp\n"
            "  Pytania:     Will + podmiot + have + pp?"
        ),
        "examples": [
            {"sentence": "She will have completed all her training by next month.", "explanation": "Twierdzące: will have + completed. By next month = przed przyszłym miesiącem."},
            {"sentence": "I won't have submitted my application before the deadline.", "explanation": "Przeczące: won't have + submitted. Czynność nie zostanie wykonana na czas."},
            {"sentence": "Will they have left by the time we arrive?", "explanation": "Pytanie: Will + they + have + left? Czy odejdą zanim my przyjedziemy?"}
        ]
    },
    "Irregular Verbs – Past Participle I": {
        "explanation": (
            "Nieregularne formy Past Participle – część I (najczęstsze)\n\n"
            "Past Participle (3. forma) używamy z have/has/had w czasach Perfect.\n"
            "Czasowniki nieregularne NIE tworzą Past Participle przez dodanie -ed!\n\n"
            "Najważniejsze czasowniki:\n"
            "  be   → been       have  → had        do    → done\n"
            "  go   → gone       say   → said        get   → got\n"
            "  make → made       know  → known       think → thought\n"
            "  take → taken      see   → seen        come  → come\n"
            "  give → given      find  → found       tell  → told\n"
            "  leave → left      feel  → felt        bring → brought\n"
            "  begin → begun     keep  → kept"
        ),
        "examples": [
            {"sentence": "I've never been to Japan before.", "explanation": "be → been (nie: 'be-d' ani 'was'). Forma been używana z have/has/had."},
            {"sentence": "She has done her homework.", "explanation": "do → done (nie: 'did' ani 'do-d'). Done = 3. forma, used with has."},
            {"sentence": "Have you found your keys yet?", "explanation": "find → found (nie: 'finded'). Found = past simple AND past participle."}
        ]
    },
    "Irregular Verbs – Past Participle II": {
        "explanation": (
            "Nieregularne formy Past Participle – część II\n\n"
            "Dwa ważne wzorce:\n\n"
            "A) Past simple = Past participle (dwie formy):\n"
            "  hear  → heard → heard     pay  → paid → paid\n"
            "  lose  → lost  → lost      send → sent → sent\n"
            "  build → built → built     buy  → bought → bought\n"
            "  catch → caught → caught   spend → spent → spent\n\n"
            "B) Trzy różne formy:\n"
            "  write → wrote → written   speak → spoke → spoken\n"
            "  fall  → fell  → fallen    drive → drove → driven\n"
            "  break → broke → broken    wear  → wore  → worn\n"
            "  choose → chose → chosen   fly   → flew  → flown\n"
            "  throw → threw → thrown    eat   → ate   → eaten\n"
            "  run   → ran   → run"
        ),
        "examples": [
            {"sentence": "I haven't written to her in ages.", "explanation": "write → wrote → written (3 różne formy). Past participle = written, nie 'wrote'!"},
            {"sentence": "She's already sent the email.", "explanation": "send → sent → sent (past simple = past participle). Obie formy brzą tak samo."},
            {"sentence": "Have you eaten anything today?", "explanation": "eat → ate → eaten (3 różne formy). Past participle = eaten, nie 'ate'!"}
        ]
    },
    "Irregular Verbs – Past Participle III": {
        "explanation": (
            "Nieregularne formy Past Participle – część III\n\n"
            "Wzorce do zapamiętania:\n\n"
            "Wzorzec -ing → -ung (sing, drink, swim):\n"
            "  drink → drank → drunk\n"
            "  sing  → sang  → sung\n"
            "  swim  → swam  → swum\n\n"
            "Formy z końcówką -en:\n"
            "  forget → forgot  → forgotten\n"
            "  hide   → hid     → hidden\n"
            "  bite   → bit     → bitten\n"
            "  ride   → rode    → ridden\n"
            "  wake   → woke    → woken\n\n"
            "Pozostałe:\n"
            "  hold  → held     win   → won     teach → taught\n"
            "  sleep → slept    sell  → sold     blow  → blown\n"
            "  freeze → frozen  tear  → torn     steal → stolen\n"
            "  shoot → shot     lend  → lent     bend  → bent"
        ),
        "examples": [
            {"sentence": "Has he ever drunk champagne before?", "explanation": "drink → drank → drunk (nie: 'drinked'!). Wzorzec: -ink → -unk."},
            {"sentence": "She has sung in many famous venues.", "explanation": "sing → sang → sung (nie: 'singed'!). Wzorzec: -ing → -ung."},
            {"sentence": "Have you ever ridden a motorbike?", "explanation": "ride → rode → ridden (forma z -en). Nie mylić z past simple: rode!"}
        ]
    },
    "Irregular Verbs – Past Participle IV": {
        "explanation": (
            "Nieregularne formy Past Participle – część IV\n\n"
            "Ważna grupa: czasowniki niezmienne (wszystkie formy takie same):\n"
            "  cut   → cut   → cut      put  → put  → put\n"
            "  let   → let   → let      set  → set  → set\n"
            "  hit   → hit   → hit      hurt → hurt → hurt\n"
            "  spread → spread → spread  read → read → read*\n"
            "  (*read wymawia się /red/ w past simple i past participle)\n\n"
            "Pozostałe z tej części:\n"
            "  deal  → dealt    sweep → swept    creep → crept\n"
            "  grow  → grown    draw  → drawn    rise  → risen\n"
            "  show  → shown    shake → shaken   stand → stood\n"
            "  meet  → met      sit   → sat      lead  → led"
        ),
        "examples": [
            {"sentence": "She has set a new world record!", "explanation": "set → set → set. Wszystkie trzy formy identyczne – uważaj, żeby nie dodać -ed!"},
            {"sentence": "Have you ever met a celebrity?", "explanation": "meet → met → met. Past simple = past participle = met (nie: 'meeted')."},
            {"sentence": "Temperatures have risen significantly.", "explanation": "rise → rose → risen (3 różne formy). Nie mylić z raised (= podnosić coś)."}
        ]
    },
    "Irregular Verbs – Past Participle V": {
        "explanation": (
            "Nieregularne formy Past Participle – część V (zaawansowane)\n\n"
            "Rzadziej spotykane, ale ważne formy:\n"
            "  mean   → meant      become → become     shine  → shone\n"
            "  spell  → spelt      weep   → wept       kneel  → knelt\n"
            "  spill  → spilt      hang   → hung        beat   → beaten\n"
            "  swear  → sworn      forbid → forbidden  forgive → forgiven\n"
            "  strike → struck     shrink → shrunk     bind   → bound\n"
            "  dig    → dug        grind  → ground     spring → sprung\n"
            "  stick  → stuck      withdraw → withdrawn\n\n"
            "Uwaga: become → became → become (past participle = infinitive)\n"
            "Uwaga: beat → beat/beaten (dwie akceptowane formy pp)"
        ),
        "examples": [
            {"sentence": "She has become a very successful lawyer.", "explanation": "become → became → become. Past participle = infinitive! (nie: 'became' jako pp)"},
            {"sentence": "They have forbidden entry to the building.", "explanation": "forbid → forbade → forbidden. Końcówka -en, jak hidden, ridden."},
            {"sentence": "The workers have dug a very deep hole.", "explanation": "dig → dug → dug. Past simple = past participle = dug (nie: 'digged')."}
        ]
    }
}

files = glob.glob(os.path.join(DATA, '*.json'))
updated = 0

for fpath in sorted(files):
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    title = data.get('title', '')
    if title in THEORY:
        data['theory'] = THEORY[title]
        with open(fpath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"  ✓ {title}")
        updated += 1
    else:
        print(f"  ? No theory for: {title}")

print(f"\nUpdated {updated}/{len(files)} files.")
