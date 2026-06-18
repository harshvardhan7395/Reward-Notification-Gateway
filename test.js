
   // function lengthOfLongestSubstring(s=" ") {
   //
   //      let longestString = 0;
   //
   //      for(let i=0;i<s.length;i++){
   //          let letter = s[i];
   //          console.log('------>',longestString, letter);
   //          for(let j=i+1;j<s.length;j++){
   //
   //              if(s[i]!==s[j]){
   //                  letter = letter + s[j];
   //              }else{
   //                  if(longestString<letter.length){
   //                      longestString = letter.length;
   //                  }
   //                  break;
   //              }
   //              console.log('-',letter);
   //          }
   //      }
   //       console.log(longestString);
   //  }
   // lengthOfLongestSubstring();

   function isPalindrome(s) {
       const st = s.toLowerCase().replace(/[^a-zA-Z0-9]/g,'');
    console.log('st', st);
       for(let i=0;i<(st.length/2+1);i++){
           if(st[i]!==st[st.length-1-i]){
               console.log('false')
               return false;
           }
       }
       console.log('true')
       return true;

   }
   isPalindrome("Was it a car or a cat I saw?")