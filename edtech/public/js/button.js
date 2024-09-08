document.addEventListener('DOMContentLoaded', (event) => {
   const button = document.getElementById('myButton');
   button.addEventListener('click', questionsGenerator);
});

let messageHistory = [];
let questions = [];  

function convertStringToArrayObject(stringArray) {
   try {
       const arrayObject = JSON.parse(stringArray);
       return arrayObject;
   } catch (error) {
       console.error('Error parsing JSON string:', error);
       return null;
   }
}


async function questionsGenerator(topic) {
   
   const message = document.getElementById('message');
   
   try {

   const questionsResponse = await fetch('/api/aimessage',{
      method : 'POST',
      headers : {
         'Content-Type' : 'application/json'
      },
      body : JSON.stringify({ prompt : topic })
   } );

   if (!questionsResponse.ok) {
      throw new Error('Failed to fetch questions!');
   }
   const data = await questionsResponse.json();
 
   questions = convertStringToArrayObject(data.aires);

   const quizContainer = document.getElementById('quiz-container');
   
   quizContainer.innerHTML = ''; // Clear previous questions

   questions.forEach((question, index) => {
      const questionDiv = document.createElement('div');
      
      questionDiv.classList.add('question');

      questionDiv.innerHTML = `
         <h3>${index + 1}. ${question.question}</h3>
         <div class="options">
            ${question.options.map((option, i) => `
               <label>
                  <input type="radio" name="question-${index}" value="${option}">
                  ${option}
               </label><br>
            `).join('')}
            <div class="explanation" id="explanation-${index}" style="display: none;">
               <strong>Explanation:</strong> ${question.explanation}
            </div>
         </div>
      `;
      quizContainer.appendChild(questionDiv);
   });
      const submitButton = document.querySelector('.submit-btn');
      submitButton.style.display = 'block';
  } catch (error) {
   console.log(error)
   message.textContent = 'Error: ' + error.message;
  }
   

}

let userResult = [];

function submitQuiz() {
   let score = 0;
   questions.forEach((question, index) => {
      const selectedOption = document.querySelector(`input[name="question-${index}"]:checked`);
      const explanationDiv = document.getElementById(`explanation-${index}`);
      if (selectedOption && selectedOption.value === question.answer) {
         score++;
         explanationDiv.style.display = 'none';
      } else {
         explanationDiv.style.display = 'block';
         userResult.push(index);
      }
   });

   const scoreMessage = document.getElementById('score')

   const result = document.getElementById('result');  

   scoreMessage.style.display = 'flex';

   result.textContent = score;

   const resultSignal = document.getElementById('resultSignal');
   
   resultSignal.style.border = score >= 3 ? '5px solid green' : '5px solid red';

}

async function reivewMyperformance(){
   
   let reviewContainer = '';

   userResult.map((qes) => {
      const questionObject = questions[qes];
      const questionString = JSON.stringify(questionObject, null, 2);
      reviewContainer += questionString;
   });
  
   const response = await fetch('/api/reviewMyPerformance',{
      method : "POST",
      headers : {
         'Content-Type' : 'application/json'
      },
      body : JSON.stringify({wrongAnsweredQuestions : reviewContainer})
   })

   if (!response.ok) {
      throw new Error('Failed to fetch questions!');
   }   

   const data = await response.json();
   console.log(data)
   const message = document.getElementById('aisuggestion');
   message.textContent = data.response;
}