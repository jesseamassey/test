const config = {
	apiKey: "AIzaSyB7wbIzyh7ENLDeSFg8O6lAu8CTBT_6MUg",
	authDomain: "test-ed96a.firebaseapp.com",
	databaseURL: "https://test-ed96a.firebaseio.com",
	projectId: "test-ed96a",
	storageBucket: "test-ed96a.appspot.com",
	messagingSenderId: "549073055220"
};
firebase.initializeApp(config);

const storageRef = firebase.storage().ref();
const employeesRef = firebase.app().database().ref('employees');
const commentsRef = firebase.app().database().ref('comments');

$(() => {
	employeePhotoEdit = $('#employeePhotoEdit');
	editEmployeeForm = $('#editEmployeeForm');
	loginForm = $('#loginForm');
	loginLinkContainer = $('#loginLinkContainer');
	logoutLinkContainer = $('#logoutLinkContainer');
	logoutLink = logoutLinkContainer.first('a');
	loginErrorContainer = $('#loginErrorContainer');
	employeePhotoInput = $('#employeePhoto');
	backdrop = $('#backdrop');
	commentsForm = $('#commentsForm');

	logoutLink.click(() => {
		firebase.auth().signOut();
	});


	firebase.auth().onAuthStateChanged(user => {
		if (user) {
			loginLinkContainer.hide();
			logoutLinkContainer.show();
		} else {
			loginLinkContainer.show();
			logoutLinkContainer.hide();
		}
	});


	loginForm.submit((event) => {
		loginErrorContainer.html('');
		firebase.auth().signInWithEmailAndPassword(event.target.username.value, event.target.password.value)
			.then(auth => {
				window.location.href = '/';
			}, error => {
				loginErrorContainer.html(error.message);
			});

		event.preventDefault();
	});

	employeePhotoInput.change(event => {
		const target = event.target;
		const file = target.files[0];
		const profileRef = storageRef.child(`${(new Date()).getTime()}${file.name}`);

		profileRef.put(file)
			.then(snapshot => {
				employeePhotoEdit.attr('src', snapshot.downloadURL)
			});

		target.value = null;
	});

	editEmployeeForm.submit(event => {
		const body = event.target;
		const key = body.key.value;
		const firstName = body.firstName.value;
		const lastName = body.lastName.value;

		backdrop.fadeIn();

		employeesRef.child(key)
			.update({
				photoURL: employeePhotoEdit.attr('src'),
				firstName: firstName,
				lastName: lastName,
				name: `${firstName} ${lastName}`
			})
			.then(() => {
				backdrop.fadeOut();
				location.href = `/employee/${key}`;
			}, error => {
				console.log(error)
				backdrop.fadeOut();
			});

		event.preventDefault();
	});


	// Comments
	commentsRef.on('child_added', comments => {
		const data = comments.val();
		$('#commentsContainer').children('[name="no-comment"]').remove();
		employeesRef.child(data.uid)
			.once('value', person => {
				$('#commentsContainer').append(
					`<li><small>${person.val().name}</small> ${comments.val().text}</li>`);
			});
		
	});

	commentsForm.submit(event => {
		const body = event.target;
		const comment = body.comment;

		commentsRef.push({ uid: firebase.auth().currentUser.uid, text: comment.value });
		comment.value = '';

		event.preventDefault();
	});
});