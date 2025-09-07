import bcrypt from 'bcryptjs';

// salt + hash password -> salt: 해싱횟수
export function saltAndHashPassword(password: string){
    const saltRounds = 10; // 해싱 횟수
    const salt = bcrypt.genSaltSync(saltRounds) // 해싱횟수만큼 해싱하는 함수
    const hash = bcrypt.hashSync(password, salt); // password값과 salt값을 넣어 해싱

    return hash;
}

//DB에 있는 비밀번호 vs 입력받은 비밀번호
export function comparePassword(password: string, hashedPassword: string){
    return bcrypt.compareSync(password, hashedPassword);
}