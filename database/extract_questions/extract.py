import csv

categories = ["geography", "animals", "movies", "music", "science-technology", "television"]
id = 1 
limit = 5
for category in categories:
    openFile = open('csv/' + category + '.csv', 'r')
    csvFile = csv.reader(openFile)
    next(csvFile)
    insert = "INSERT INTO questions VALUES "
    points = 10
    for row in csvFile:
        question = row[1]
        correct = row[2] 
        ans_a = row[3]
        ans_b = row [4]
        ans_c = row [5] 
        ans_d = row [6]
        values = list(map((lambda x: '\''+x+'\''), [category, question, ans_a, ans_b, ans_c, ans_d, correct]))
        values.append(str(points))
        row_id = id
        values.insert(0, str(row_id))
        print(insert +"(" + ", ".join(values) + ");")
        if (id % limit) == 0:
            id += 1
            points = 10 
            break
        else: 
            id += 1
            points += 10 
    openFile.close()
