var fs = require('fs');
var stdin = process.openStdin();

var stimuli = [];
var expstimulus = undefined;

function stexists() {
	for (a = 0; a < stimuli.length; a++) {
		if (stimuli[a].stimulus == expstimulus) {
			return [true, a];
		}
	}
	return [false];
}

function reexists(a, mes) {
	for (b = 0; b < stimuli[a].responses.length; b++) {
		if (stimuli[a].responses[b].response == mes) {
			return [true, b];
		}
	}
	return [false];
}

stdin.addListener("data", function(input) {
	stimuli = JSON.parse(fs.readFileSync('stimuli.json')).stimuli;
	if (expstimulus !== undefined) {																	//start of learning code
		if (stexists()[0]) {																			//stimulus exists
			lstindex = stexists()[1];
			if (reexists(lstindex, input.toString().substring(0, input.length-1).trim())[0]) {			//response exists
				lreindex = reexists(lstindex, input.toString().substring(0, input.length-1).trim())[1];
				stimuli[lstindex].responses[lreindex].frequency++;
			}
			else {																						//new response
				stimuli[lstindex].responses.push({
					response: input.toString().substring(0, input.length-1).trim(),
					frequency: 1
				});
			}
		}
		else {																							//new stimulus
			stimuli.push({
				stimulus: expstimulus,
				responses: [
					{
						response: input.toString().substring(0, input.length-1).trim(),
						frequency: 1
					}
				]
			});
		}
	}																									//end of learning code
	var stindex = undefined;
	var reindex = undefined;
	for (a = 0; a < stimuli.length; a++) {
		if (stimuli[a].stimulus == input.toString().substring(0, input.length-1).trim()) {
			stindex = a;
		}
	}
	if (stindex === undefined) {
		console.log('');
	}
	else {
		maxFreq = 0;
		for (b = 0; b < stimuli[stindex].responses.length; b++) {
			if (stimuli[stindex].responses[b].frequency > maxFreq) {
				reindex = b;
				maxFreq = stimuli[stindex].responses[b].frequency;
			}
		}
		console.log(stimuli[stindex].responses[reindex].response);
		expstimulus = stimuli[stindex].responses[reindex].response;
	}
	fs.writeFileSync('stimuli.json', JSON.stringify({stimuli: stimuli}));
});