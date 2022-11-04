import { LinearGradient } from 'expo-linear-gradient';
import React, { Component } from 'react'
import { View, Text, Button, Image, Alert, TouchableOpacity, Platform, Pressable } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import RNPickerSelect from 'react-native-picker-select';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../assets/colors/colors';
import styles from '../../assets/styles/styles';
import AuthTextInput from '../AuthTextInput';
import backButton from '../../assets/images/backButton.png'
import fire from '../fire'
import { ImageBackground } from 'react-native-web';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { TextInput } from 'react-native-gesture-handler';

export default class CreateProfile extends Component {

    constructor(props) {
        super(props)

        // Holds the state that the user inputs which by default is an empty string
        this.state = {
            email: this.props.route.params.email,
            password: this.props.route.params.password,
            first_name: '',
            last_name: '',
            sex: '',
            age: '',
            feet: '',
            inches: '',
            weight: '',
            bmi: '',
            purpose: '',
            id: '',
            hobbies: '',
        }
        this.onCreateProfile = this.onCreateProfile.bind(this)
    }

    // onCreateProfile() - create a new user in firebase collection users with the entered data and
    // navigates to Log page to begin using the app!
    onCreateProfile = () => {
        // retrieves all user attributes from the state to persist to database
        const { email, password, first_name, last_name, sex, age, feet, inches, weight, bmi, purpose, hobbies } = this.state;
        const wallet = 0.0;
        // Calculate the bmi for the user given the user attributes
        let bmiCalc = this.calcBMI();

        // firebase write doc
        fire.auth().createUserWithEmailAndPassword(email, password).then((result) => {
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
                email,
                wallet,
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

        // Navigate user to Log/Home Page
        this.props.navigation.navigate("Log", { email: email, password: password, first_name: first_name, last_name: last_name, sex: sex, age: age, feet: feet, inches: inches, weight: weight, bmi: bmiCalc, hobbies: hobbies });
    }

    // calcBMI() - Calculates a User's BMI given the user input to store in the database to determine caloric intake
    calcBMI = () => {
        let totalHeight = (this.state.feet * 12) + parseFloat(this.state.inches);
        return ((this.state.weight * 703) / (totalHeight * totalHeight)).toFixed(2);
    }

    // validateNumbers() - This function validates the proper input from the user when inputting fields
    validateUserData = () => {
        const { first_name, last_name, sex, age, feet, inches, weight, purpose, hobbies } = this.state;
        let errorMsg = 'Invalid fields:';
        let isError = false;

        //Check if name is empty
        if (first_name == '' || last_name == '') {
            errorMsg += '\nName';
            isError = true;
        }
        //Check if sex is empty
        if (sex == '' || sex == 'Select your sex...') {
            errorMsg += '\nSex';
            isError = true;
        }
        //Check if age is valid
        if (age == '' || isNaN(age) || age < 1 || age > 120) {
            errorMsg += '\nAge';
            isError = true;
        }
        //Check if height is valid
        if (inches == '' || isNaN(inches) || inches < 0 || inches > 11 || feet == '' || isNaN(feet) || feet < 0 || feet > 10) {
            errorMsg += '\nHeight';
            isError = true;
        }
        //Check if weight is valid
        if (weight == '' || isNaN(weight) || weight < 0 || weight > 1500) {
            errorMsg += '\nWeight';
            isError = true;
        }
        //Check if purpose section is empty
        if (purpose == '' || purpose == 'Would you like to donate weight, or receive weight?'){
            errorMsg += '\nSelect a Purpose: Donate or Recieve Weight';
            isError = true;
        }
        //Check if hobbies section is empty
        if (hobbies == '') {
            errorMsg += '\nHobbies';
            isError = true;
        }

        //If an error was detected.
        if (isError == true) {
            alert(errorMsg);
            isError = false;
        }
        //If everything is valid
        else {
            // Call onCreateProfile to create the profile and continue registration process
            // if all values are valid
            this.onCreateProfile();
        }
    }

    render() {
        // Destructure email and password from state to have access to these values
        const { navigate } = this.props.navigation;
        return (
            <View style={styles.container}>
                <LinearGradient
                    // Background Linear Gradient
                    colors={[colors.lightBlue, colors.darkBlue]}
                    style={styles.background}
                >
                    <SafeAreaView>
                        <KeyboardAwareScrollView
                            resetScrollToCoords={{ x: 0, y: 0 }}
                            scrollEnabled={false}
                        // contentContainerStyle={ Platform.OS === "ios" ? styles.ios : {} }
                        >
                             <View style={{ width: '18%', height: 50 }}>
                                <Pressable onPress={() => this.props.navigation.navigate("Register")}
                                    style={{ marginTop: 5, marginLeft: 5, flexDirection: 'row' }}>
                                    <Image source={backButton} style={{ width: 20, height: 20 }} />
                                    <Text style={{ marginTop: 0, color: 'black' }}>Go back</Text>
                                </Pressable>
                            </View>
                            <View style = {styles.container}>
                                <View style = {{margin: 20}}>
                                    <View style = {{alignItems: 'center'}}>
                                        <TouchableOpacity onPress={() => this.props.navigation.navigate("AddContainer")}>
                                            <View style={{
                                                height: 100,
                                                width: 100,
                                                borderRadius: 15,
                                                justifyContent: 'center',
                                                alignItems:'center',
                                            }}>
                                                <ImageBackground
                                                source={require('../../assets/images/default_profile.jpg')}
                                                style ={{height: 100, width: 100}}
                                                imageStyle={{borderRadius: 15}}
                                                >
                                                    <View style ={{
                                                        flex: 1,
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                    }}>
                                                        <Icon name="camera" size={35} color="fff" style={{
                                                            opacity: 0.5,
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            borderWidth: 1,
                                                            borderColor: '#fff',
                                                            borderRadius: 10,
                                                        }} />
                                                    </View>
                                                </ImageBackground>
                                            </View>
                                        </TouchableOpacity>
                                        <Text style ={{marginTop: 10, fontSize: 18, fontWeight: 'bold'}}>
                                            Create Profile
                                        </Text>
                                    </View>

                                    <View style={styles.action}>
                                        <FontAwesome name="user" size={20} />
                                        <TextInput
                                            placeholder='First Name'
                                            onChangeText={first_name => this.setState({ first_name })}
                                            placeholderTextColor="#000000"
                                            autoCorrect={false}
                                            style={styles.textInput}
                                        />
                                    </View>
                                    <View style={styles.action}>
                                        <FontAwesome name="user" size={20} />
                                        <TextInput
                                            placeholder='Last'
                                            onChangeText={last_name => this.setState({ last_name })}
                                            placeholderTextColor="#000000"
                                            autoCorrect={false}
                                            style={styles.textInput}
                                        />
                                    </View>
                                    <View style={styles.action}>
                                        <FontAwesome name="venus-mars" size={20} />
                                        <Text style = {styles.textInput}>
                                                Sex
                                            </Text>
                                        <RNPickerSelect
                                            items={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }]}
                                            onValueChange={sex => this.setState({ sex })}
                                            returnKeyType='done'
                                        />
                                    </View>
                                    <View style={styles.action}>
                                        <FontAwesome name="birthday-cake" size={20} />
                                        <TextInput
                                            placeholder='Age'
                                            onChangeText={age => this.setState({ age })}
                                            placeholderTextColor="#000000"
                                            autoCorrect={false}
                                            style={styles.textInput}
                                        />
                                    </View>
                                    <View style={styles.action}>
                                        <FontAwesome name="id-card" size={20} />
                                        <TextInput
                                            placeholder='Feet'
                                            onChangeText={feet => this.setState({ feet })}
                                            placeholderTextColor="#000000"
                                            autoCorrect={false}
                                            style={styles.textInput}
                                        />
                                    </View>
                                    <View style={styles.action}>
                                        <FontAwesome name="id-card" size={20} />
                                        <TextInput
                                            placeholder='Inches'
                                            onChangeText={inches => this.setState({ inches })}
                                            placeholderTextColor="#000000"
                                            autoCorrect={false}
                                            style={styles.textInput}
                                        />
                                    </View>
                                    <View style={styles.action}>
                                        <FontAwesome name="balance-scale" size={20} />
                                        <TextInput
                                            placeholder='Weight'
                                            onChangeText={weight => this.setState({ weight })}
                                            placeholderTextColor="#000000"
                                            autoCorrect={false}
                                            style={styles.textInput}
                                        />
                                    </View>
                                    <View style={styles.action}>
                                        <FontAwesome name="id-card" size={20} />
                                        <Text style = {styles.textInput}>
                                                Purpose
                                            </Text>
                                        <RNPickerSelect
                                            placeholder = {{label:'Donate or Recieve weight?', value: ''}}
                                            items = {[{label: 'Donate', value: 'donate'}, {label: 'Receive', value: 'receive'}]}
                                            onValueChange={purpose => this.setState({ purpose })}
                                            returnKeyType = 'done'
                                        />
                                    </View>
                                    <View style={styles.action}>
                                        <FontAwesome name="info" size={20} />
                                        <TextInput
                                            placeholder='Hobbies'
                                            onChangeText={hobbies => this.setState({ hobbies })}
                                            placeholderTextColor="#000000"
                                            autoCorrect={false}
                                            style={styles.textInput}
                                        />
                                    </View>
                                    <TouchableOpacity style={styles.RegisterButton} onPress={() => this.validateUserData()}>
                                        <Text style={styles.RegisterButtonTitle}>Register</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </KeyboardAwareScrollView>
                    </SafeAreaView>
                </LinearGradient>
            </View>

        )
    }
}