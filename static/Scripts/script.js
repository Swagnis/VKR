var core = {};

jQuery.fn.extend({
    disable: function(state) {
        return this.each(function() {
            this.disabled = state;
        });
    }
});

$.extend(core, {
    // Sending requests
    ajax: {
        get: (url, successCallback, errorCallback) => {
            return $.ajax({
                url: url,
                type: "GET",
                cache: false,
                success: successCallback,
                error: errorCallback
            });
        },
        getJson: (url, data, successCallback, errorCallback) => {
            return $.ajax({
                url: url,
                type: "GET",
                cache: false,
                data: JSON.stringify(data),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: successCallback,
                error: errorCallback
            });
        },
        postJson: (url, data, successCallback, errorCallback) => {
            return $.ajax({
                url: url,
                type: "POST",
                cache: false,
                data: JSON.stringify(data),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: successCallback,
                error: errorCallback
            });
        }
	},
	graph: {
		root: "",
        nodes: [],
        network: null,
        agentNetwork: null,
        onSelect: (params) => {
            if (params.nodes){
                let node = core.graph.nodes.find(x => x.name === nodes[params.nodes].label)
                $table = $("#table");
                $table.bootstrapTable('load', core.graph.nodes.filter(x => x.parent === node.name));
                let $form = $("#keyword").val(node.name);
            }
        }
	}
});

function onClick() {
    let url = "http://localhost:5000/api/";
    core.ajax.get(
        url,
        response => {
            alert(response.api);
        },
        jqXHR => {
            console.log("ajax error " + jqXHR.status);
        }
    );
}


// Прикрутить Knockout
function tableAddRow() {
	let dialog = $('#dialogAddRow');
	let relation = dialog.find('#relation-name').val();
	let relatedObject = dialog.find('#relatedObject-text').val();
	dialog.find('#relation-name').val("");
	dialog.find('#relatedObject-text').val("");

	let $form = $("#keyword");
	let keyword = $form.val();
	if (!keyword) return;

    let $table = $("#table");
	let randomId = 100 + ~~(Math.random() * 100);
	let row = {
		id: randomId,
		relation: relation,
		name: relatedObject
	};
    $table.bootstrapTable("insertRow", {
        index: 1,
        row: row
	});
	// Добавляем в иерархический объект
	core.graph.nodes.push($.extend(row, {
		parent: keyword
	}));
	draw(core.graph.network, "graph", core.graph.onSelect);
}

function tableRemoveRow() {
	let $form = $("#keyword");
	let keyword = $form.val();
	if (!keyword) return;

    let $table = $("#table");
	$table.bootstrapTable("getSelections").forEach((row) => {
		if (core.graph.nodes.filter(x => x.parent === row.name).length > 0) return;
		core.graph.nodes = core.graph.nodes.filter(x => x.id !== row.id)
		$table.bootstrapTable("remove", {
			field: "id",
			values: [row.id]
		});
	});

	draw(core.graph.network, "graph", core.graph.onSelect);
}

function onKeyWordChange() {
	let $form = $("#keyword");
	let keyword = $form.val();
	// Enabled with:
	$('#add').disable(!keyword);
    $('#remove').disable(!keyword);
    $('#save').disable(!keyword);

	if (keyword) {
		$('#keyword').disable(keyword);
		core.graph.root = keyword;
		core.graph.nodes.push({
			id: null,
			relation: null,
			name: keyword,
			parent: null
        });
	}
}

function onSaveClicked() {
    let nodes = core.graph.nodes;
    let data = {
        denotatbase: nodes.map((item) => {
            return item;
        })
    }
    download(JSON.stringify(data), "graphNodes.json", "text/plain");
}

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

function getCollocations() {
    let url = "http://localhost:5000/api/GetCollocations";
    let N = $('#pickerN').val();
    let rules = $('#filtrationRules').val();
    let text = $('#inputText').val();
    let language = $('#languageDropdown').val();
    let data = {
        text: text,
        rules: rules,
        number: N,
        language: language
    };
    core.ajax.postJson(
        url,
        data,
        response => {
            $('#collocationList')[0].options.length = 0;
            response.collocations.forEach((item, index) => {
                $('#collocationList').append($('<option>', {
                    value: index,
                    text : item
                }));
            });
        },
        jqXHR => {
            console.log("ajax error " + jqXHR.status);
        }
    );
}

function getAnalysis() {
    let url = "http://localhost:5000/api/GetAnalysis";
    let text = $('#inputTextForAnalysis').val();
    let data = {
        text: text
    };
    let dict = {
        S: "Существительное",
        ["муж"]: " мужской род",
        ["од=им"]: " одушевленное, именительный падеж",
        ["ед"]: " единственное число",
        V: "Глагол",
        ["пе=непрош"]: " переходный, непрошедшее время",
        ["изъяв"]: " изъявительное наклонение",
        ["3-л"]: " 3-е лицо",
        ["несов"]: " несовершенный",
    };

    core.ajax.postJson(
        url,
        data,
        response => {
            let analysis = response.analysis;
            let summary = "";
            analysis.forEach((item, index) => {
                if (item.analysis && item.analysis.length > 0) {
                    summary += `<a href="#" id ="hoverme${index}" data-toggle="tooltip" title="${Object.keys(item.analysis[0]).map(x => item.analysis[0][x]).map(y => {
                        if (y.split) {
                            let spl = y.split(',');
                            spl = spl.map(x => dict[x] ? dict[x] : x);
                            return spl.join(',');
                        } else return `Вес: ${y}`; // return y;
                    }).join(',\n')}">${item.text}</a>`;
                } else {
                    summary += item.text
                }
            });
            document.getElementById("#outputAnalysis").innerHTML = summary;

            $(function () {
                $('[data-toggle="tooltip"]').tooltip()
            })
        },
        jqXHR => {
            console.log("ajax error " + jqXHR.status);
        }
    );
}

function uploadGraph(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var contents = JSON.parse(e.target.result);
      core.graph.nodes = contents.denotatbase;
      core.graph.root = contents.denotatbase.find(x => !x.parent).name;
      $('#ask').disable(false);
      draw(core.graph.nodes.agentNetwork, "agentGraph");
    };
    reader.readAsText(file);
}

function questionAsk() {
    let url = "http://localhost:5000/api/GetAnswer";
    let question = $('#question-text').val();
    let data = {
        graph: core.graph.nodes,
        question: question
    };
    core.ajax.postJson(
        url,
        data,
        response => {
            let answer = response.answer;
            $('#theAnswer').val(`${answer.parent} ${answer.relation} ${answer.name}`);
        },
        jqXHR => {
            console.log("ajax error " + jqXHR.status);
        }
    );
}

$(document).on('change', '#selectFile', function() {
    var input = $(this);
    uploadGraph(input.get(0).files[0])
});