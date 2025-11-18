function Validator(formSelector) {
    let _this = this
    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }
    let formRules = {}
    
    let validatorRules = {
        required: function (value) {
            return value ? undefined : 'Vui lòng nhập trường này'
        },
        email: function (value) {
            let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Trường này phải là email'
        },
        min: function (min) {
            return function(value) {
                return value.length >= min ? undefined : `Vui lòng nhập tối thiếu ${min} kí tự`

            }
            
        }
    }
    let formElement = document.querySelector(formSelector)
    
    if(formElement) {

        let inputs = formElement.querySelectorAll('[name][rules]')
        
        for (let input of inputs) {
            let rules = input.getAttribute('rules').split('|')

            for(let rule of rules) {

                let ruleInfo
                let isRuleHasValue = rule.includes(':')
                if (isRuleHasValue) {
                    ruleInfo = rule.split(':')
                    rule = ruleInfo[0]

                    // console.log(validatorRules[rule](ruleInfo[1]))
                }

                let ruleFunc = validatorRules[rule]
                if(isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1])
                }
                // console.log(rule)
                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc)
                } else {
                    // console.log(rule)
                    formRules[input.name] = [ruleFunc]
                    
                }
            }
            // Lắng nghe sự kiện để validate (blur, onchange , ...) 
            input.onblur = handleValidate
            input.oninput = handleClearError
        }
        // Hàm thực hiện Validate 
        function handleValidate(event) {
           let rules = formRules[event.target.name]
           let errorMessage

           for(let rule of rules) {
                errorMessage =  rule(event.target.value)
                if(errorMessage) break
           }
        //  Nếu có lỗi thì hiển thị message lỗi ra UI
           if (errorMessage) {

               let formGroup =  getParent(event.target, '.form-group')
               if(formGroup) {
                  formGroup.classList.add('invalid')
                  let formMessage = formGroup.querySelector('.form-message')
                  if (formMessage) {
                      formMessage.innerText = errorMessage
                  }
               }
           }
           return !errorMessage
        }
      
        // Hàm clear message lỗi 
        function handleClearError(event) {
            let formGroup =  getParent(event.target, '.form-group')  
            if(formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid')

                let formMessage = formGroup.querySelector('.form-message')
                if (formMessage) {
                      formMessage.innerText = ''
                }

            }

        }
        // Xử lí hành vi submit form 
        formElement.onsubmit = function(event) {
            event.preventDefault()

            let inputs = formElement.querySelectorAll('[name][rules]')
            let isValid = true
            for (let input of inputs) {
               if (!handleValidate({target: input})) {
                    isValid = false
               }
            }
             // Khi 0 có lỗi thì submit form 
            if(isValid) {

               if(typeof _this.onSubmit === 'function') {
                  let enableInputs = formElement.querySelectorAll('[name]')
                    let formValues = Array.from(enableInputs).reduce(function(values, input) {

                        switch (input.type) {
                            case 'radio':
                            case 'checkbox':
                                if(input.matches(':checked')) {
                                     values[input.name] = input.value
                                }
                                break;

                            default: 
                                values[input.name] = input.value
                        }
                        return values
                    }, {})
                    // Gọi lại hàm onSubmit và trả về giá trị của form
                    _this.onSubmit(formValues)
               } else {
                   formElement.submit()
               }
            }
        }
       
        // console.log(formRules)

    } 
}   
// animation 
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.js-animate').forEach(el => {
  observer.observe(el);
});



// fetch api 
const api_url = "https://690948e12d902d0651b33485.mockapi.io/img_project";

async function loadProjects() {
  try {
    const res = await fetch(api_url);
    const data = await res.json();

    const container = document.getElementById("projectContainer");
    if (!container) {
      console.error("Không tìm thấy projectContainer trong HTML");
      return;
    }

    container.innerHTML = data.map((item, index) => `
      <div class="carousel-item ${index === 0 ? "active" : ""}">
        <div class="d-flex justify-content-center">
          <div class="card border-0 shadow-sm" style="width: 80%;">
            <img 
              src="${item.image}" 
              class="card-img-top rounded project-img"
              alt="${item.title}">
            <div class="card-body text-center">
              <h5 class="card-title fw-bold">${item.title}</h5>
            </div>
          </div>
        </div>
      </div>
    `).join("");

    document.querySelectorAll('.project-img').forEach(img => {
      img.addEventListener('error', () => {
        img.src = 'https://picsum.photos/800/600?grayscale';
      });
    });

  } catch (err) {
    console.error("Error loading projects:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadProjects);


