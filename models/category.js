class Category {

    constructor(name, numQuestions) {
        this.name = name;
        this.numQuestions = numQuestions;
        this.questions = [];
    }
    
    addQuestion(title, choices, answer, points){
        var question = new Question(title, choices, answer, points);
        this.questions.push(question);
    }
    getQuestion(index){
        return this.questions[index];
    }
}

class Question {

    constructor(title, choices, answer, points) {
        this.title = title;
        this.points = points; 
        this.choices = choices; 
        this.answer = answer; 
    }

}
module.exports = Category;