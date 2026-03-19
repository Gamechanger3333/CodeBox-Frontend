import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';

const Logout = ({ clickingLogout }) => {
  return (
    <button onClick={clickingLogout}
      className="w-full flex items-center gap-2 text-[#adadb8] hover:text-white hover:bg-[#ffffff10] rounded-lg px-3 py-2 text-sm transition">
      <FontAwesomeIcon icon={faRightFromBracket} />
      Log out
    </button>
  );
};

export default Logout;