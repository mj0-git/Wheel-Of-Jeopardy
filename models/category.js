class Category {

    constructor(name, numQuestions) {
        this.name = name;
        this.numQuestions = numQuestions;
        this.questions = [];
    }
    
    addQuestion(title, choices, answer){
        var question = new Question(title, choices, answer);
        this.questions.push(question);
    }
}

class Question {

    constructor(title, choices, answer) {
        this.title = title;
        this.choices = choices; 
        this.answer = answer; 
    }

}
module.exports = Category;