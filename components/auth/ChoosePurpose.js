import React, { Component } from 'react'
import { View, Text, Button, Image, Alert, Pressable } from 'react-native'
import RNPickerSelect from 'react-native-picker-select';
import backButton from '../../assets/images/backButton.png'
import fire from '../fire'

export default class CreateProfile extends Component {

    constructor(props) {
        super(props)

        // Holds attributes of user which are passed in as props from CreateProfile.js
        this.state = {
            email: this.props.route.params.email,
            password: this.props.route.params.password,
            first_name: this.props.route.params.first_name,
            last_name: this.props.route.params.last_name,
            sex: this.props.route.params.sex,
            age: this.props.route.params.age,
            feet: this.props.route.params.feet,
            inches: this.props.route.params.inches,
            weight: this.props.route.params.weight,
            bmi: this.props.route.params.bmi,
            purpose: '',
            id: '',
            hobbies: this.props.route.params.hobbies
        }
        this.onSignUp = this.onSignUp.bind(this)
    }

    // onSignUp() - create a new user in firebase collection users with the entered data
    onSignUp = () => {
        // retrieves all user attributes from the state to persist to database
        const { first_name, last_name, sex, age, feet, inches, weight, bmi, purpose, hobbies } = this.state;

        // firebase write doc
        fire.auth().createUserWithEmailAndPassword(this.state.email, this.state.password).then((result) => {
            fire.firestore().collection("users")
            .doc(fire.auth().currentUser.uid)
            .set({
                first_name,
                last_name,
                sex,
                age,
                feet,
                inches,
                weight,
                bmi,
                purpose,
                hobbies,
                profilePicId: 'https://firebasestorage.googleapis.com/v0/b/weightexchangeapplication.appspot.com/o/image%2Fdefault-avatar.jpg?alt=media&token=057e9e50-5f95-4123-967c-ede0dea7076a',
                id: fire.auth().currentUser.uid,
            }).then(() => {
                console.log("Document successfully written!");
                this.setState({ bmi: bmi });
            })
            .catch((error) => {
                console.error("Error writing document: ", error);
            })
        }).catch((error) => {
            console.log(error);
            Alert.alert('Error', error.message, [{text: 'OK'},], {cancelable: true});
        })
    }

    // validatePurpose() - Validates that the user has chosen their purpose
    validatePurpose = () => {
        if (this.state.purpose != '' && this.state.purpose != 'Would you like to donate weight, or receive weight?') {
            this.onSignUp();
        }
        else {
            alert('This field cannot be empty!')
        }
    }

    render() {
        // Destructure email and password from state to have access to these values
        const { navigate } = this.props.navigation;

        return (
            
            
            <View style = {styles.contentCenter}>
            <View style={{width: '25%', height: 60}}>
                    <Pressable onPress={() => this.props.navigation.navigate("CreateProfile")} 
                        style={{marginTop: 53, marginLeft: -150, flexDirection: 'row'}}>
                        <Image source={backButton} style={{width: 20, height: 20}} />
                        <Text style={{color: 'white'}}>Go back</Text>
                    </Pressable>
            </View>               
            <Image style = {styles.loginImage} source = {require("../../assets/icon.png")}/>
                <View style = {styles.loginPrompt}>      
                    <RNPickerSelect
                        style = {{backgroundColor: 'white'}}
                        placeholder = {{label:'Would you like to donate weight, or receive weight?', value: ''}}
                        items = {[{label: 'Donate', value: 'donate'}, {label: 'Receive', value: 'receive'}]}
                        onValueChange={purpose => this.setState({ purpose })}
                        returnKeyType = 'done'
                    />
                    <Button
                        onPress={() => this.validatePurpose()}
                        title="Register"
                    />
                </View>
            </View>
        )
    }
}

const styles = {
    loginPrompt: {
        marginTop: 30,
        marginLeft: 24,
        marginRight: 24,
        marginBottom: 70
    },
    loginImage: {
        width: 250,
        height: 250,
        marginLeft: 20,
        marginTop: 30,
        marginBottom: 30,
    },
    inputLabel: {
        width: 280,
        height: 45,
        borderColor: "#43519D",
        backgroundColor: "#FFFFFF"
    },
    userLabel: {
        fontSize: 20,
        color: "#414E93"
    },
    contentCenter: {
        height: '100%',
        backgroundColor: "#192879",
        alignItems: 'center'
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: '100%'
    },
    logo: {
        width: 163,
        height: 161,
        paddingTop: '5%'
    },
    headerText: {
        fontSize: 22,
        color: '#FFF',
        fontFamily: 'NunitoSans-Bold',
        paddingHorizontal: 51,
        marginBottom: 7
    },
    footerText: {
        flexDirection: 'row', 
        justifyContent: 'flex-end',
        marginRight: 37,
    },
    textBold: {
        color: '#FFF',
        fontFamily: 'NunitoSans-Bold',
        fontSize: 14
    },
    textRegular: {
        color: '#FFF',
        fontFamily: 'NunitoSans-Regular',
        fontSize: 14
    },
    button: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Montserrat-SemiBold',
        marginLeft: '35%',
        marginTop: '32%'
    },
    ios: {
        height: '100%', 
        width: '100%' 
    }
}